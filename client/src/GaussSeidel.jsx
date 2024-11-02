import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Table, Alert } from 'react-bootstrap';
import Axios from 'axios';

const GaussSeidel = () => {
    const [size, setSize] = useState(0);
    const [matrixA, setMatrixA] = useState([]);
    const [vectorB, setVectorB] = useState([]);
    const [solutionX, setSolutionX] = useState([]);
    const [showOutput, setShowOutput] = useState(false);
    const [error, setError] = useState(null); // State for error messages
    const [No, setNo] = useState(14); // Setting No = 12 for fetching data

    useEffect(() => {
        getData();
    }, [No]);

    useEffect(() => {
        const newMatrixA = Array.from({ length: size }, () => Array(size).fill(0));
        const newVectorB = Array(size).fill(0); // Initialize vector b when size changes
        setMatrixA(newMatrixA);
        setVectorB(newVectorB);
    }, [size]);

    const getData = () => {
        Axios.get(`http://localhost:3001/${No}`).then((response) => {
            const receivedData = response.data;
            if (receivedData) {
                const parsedA = JSON.parse(receivedData.a);
                const parsedB = JSON.parse(receivedData.b);
                setMatrixA(parsedA);
                setVectorB(parsedB);
                setSize(parseInt(receivedData.n, 10));
            } else {
                setError("No data found for the specified No.");
            }
        }).catch((error) => {
            setError("Error fetching data: " + error.message);
        });
    };

    const updateData = () => {
        Axios.put(`http://localhost:3001/update/${No}`, {
            n: size.toString(),
            a: JSON.stringify(matrixA),
            b: JSON.stringify(vectorB)
        }).then(() => {
            console.log("Data updated successfully");
        }).catch((error) => {
            console.error("Error updating data:", error);
        });
    };

    const gaussSeidelIteration = (iterations = 25) => {
        const n = size;
        let xOld = Array(n).fill(0);
        let xNew = Array(n).fill(0);

        for (let it = 0; it < iterations; it++) {
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (j !== i) {
                        sum += matrixA[i][j] * xNew[j]; // Use the updated value
                    }
                }
                xNew[i] = (vectorB[i] - sum) / matrixA[i][i];
            }
            xOld = [...xNew]; // Update old values
        }

        setSolutionX(xNew);
        setShowOutput(true);
    };

    const handleInputChange = (i, j, value) => {
        const newMatrix = [...matrixA];
        newMatrix[i][j] = parseFloat(value);
        setMatrixA(newMatrix);
        updateData();
    };

    const handleVectorBChange = (i, value) => {
        const newVectorB = [...vectorB];
        newVectorB[i] = parseFloat(value);
        setVectorB(newVectorB);
        updateData();
    };

    return (
        <Container>
            <h2>Gauss-Seidel Method</h2>
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error message */}
            <Form>
                <Form.Group>
                    <Form.Label>Size of Matrix</Form.Label>
                    <Form.Control
                        type="number"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value) || 0)}
                    />
                </Form.Group>
                {matrixA.length > 0 && (
                    <div>
                        <h4>Matrix [A]</h4>
                        {matrixA.map((rowArray, i) => (
                            <div key={i} style={{ display: 'flex' }}>
                                {rowArray.map((value, j) => (
                                    <Form.Control
                                        key={`a${i}${j}`}
                                        type="number"
                                        value={value}
                                        onChange={(e) => handleInputChange(i, j, e.target.value)}
                                        style={{ width: '60px', marginRight: '5px' }}
                                    />
                                ))}
                            </div>
                        ))}
                        <h4>Vector [B]</h4>
                        {vectorB.map((value, i) => (
                            <Form.Control
                                key={`b${i}`}
                                type="number"
                                value={value}
                                onChange={(e) => handleVectorBChange(i, e.target.value)}
                                style={{ width: '60px', marginBottom: '5px' }}
                            />
                        ))}
                        <Button variant="dark" onClick={() => gaussSeidelIteration()}>Calculate Gauss-Seidel Method</Button>
                    </div>
                )}
            </Form>
            {showOutput && (
                <div>
                    <h4>Solution Vector [X]</h4>
                    <Table striped bordered hover variant="dark">
                        <tbody>
                            <tr>
                                {solutionX.map((value, index) => (
                                    <td key={index}>{value.toFixed(4)}</td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default GaussSeidel;
