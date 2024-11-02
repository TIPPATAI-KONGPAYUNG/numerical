import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Table, Alert } from 'react-bootstrap';
import Axios from 'axios';

const CholeskyDecomposition = () => {
    const [size, setSize] = useState(0);
    const [matrixA, setMatrixA] = useState([]);
    const [vectorB, setVectorB] = useState([]);
    const [lowerMatrix, setLowerMatrix] = useState([]);
    const [solutionX, setSolutionX] = useState([]);
    const [showOutput, setShowOutput] = useState(false);
    const [error, setError] = useState(null);  
    const [No, setNo] = useState(12);  

    useEffect(() => {
        getData();
    }, [No]);

    useEffect(() => {
        const newMatrixA = Array.from({ length: size }, () => Array(size).fill(0));
        const newVectorB = Array(size).fill(0);  
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

    const choleskyDecomposition = () => {
        const n = size;
        const lower = Array.from({ length: n }, () => Array(n).fill(0));
        setError(null); // Reset error  
        try {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j <= i; j++) {
                    let sum = 0;
                    for (let k = 0; k < j; k++) {
                        sum += lower[i][k] * lower[j][k];
                    }
                    if (i === j) {
                        const diagValue = matrixA[i][i] - sum;
                        if (diagValue <= 0) {
                            throw new Error("Matrix is not positive definite.");
                        }
                        lower[i][j] = Math.sqrt(diagValue);
                    } else {
                        if (lower[j][j] === 0) {
                            throw new Error("Zero value encountered on diagonal.");
                        }
                        lower[i][j] = (1.0 / lower[j][j]) * (matrixA[i][j] - sum);
                    }
                }
            }

            setLowerMatrix(lower);
            calculateSolution(lower);
            setShowOutput(true);
        } catch (error) {
            setError("Error during Cholesky decomposition: " + error.message);
            setShowOutput(false);
        }
    };

    const calculateSolution = (lower) => {
        const n = size;
        const y = Array(n).fill(0);
        const x = Array(n).fill(0);

        try {
            for (let i = 0; i < n; i++) {
                y[i] = vectorB[i];
                for (let j = 0; j < i; j++) {
                    y[i] -= lower[i][j] * y[j];
                }
            }

            for (let i = n - 1; i >= 0; i--) {
                x[i] = y[i];
                for (let j = i + 1; j < n; j++) {
                    x[i] -= lower[j][i] * x[j];
                }
                if (lower[i][i] === 0) {
                    throw new Error("Zero value encountered on diagonal during back substitution.");
                }
                x[i] /= lower[i][i];
            }

            setSolutionX(x);
        } catch (error) {
            setError("Error during solution calculation: " + error.message);
        }
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
            <h2>Cholesky Decomposition</h2>
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
                        <Button variant="dark" onClick={choleskyDecomposition}>Calculate Cholesky Decomposition</Button>
                    </div>
                )}
            </Form>
            {showOutput && (
                <div>
                    <h4>Lower Triangular Matrix [L]</h4>
                    <Table striped bordered hover variant="dark">
                        <tbody>
                            {lowerMatrix.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((value, colIndex) => (
                                        <td key={colIndex}>{value.toFixed(4)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
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

export default CholeskyDecomposition;
