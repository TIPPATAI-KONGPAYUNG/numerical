import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import Axios from 'axios';

const Lu = () => {
    const [size, setSize] = useState(0);
    const [matrixA, setMatrixA] = useState([]);
    const [vectorB, setVectorB] = useState([]);
    const [lowerMatrix, setLowerMatrix] = useState([]);
    const [upperMatrix, setUpperMatrix] = useState([]);
    const [solutionX, setSolutionX] = useState([]); // State for solution vector x
    const [showOutput, setShowOutput] = useState(false);
    const [No, setNo] = useState(11); // Setting No = 11 for fetching data

    useEffect(() => {
        getData();
    }, [No]);

    useEffect(() => {
        const newMatrixA = Array.from({ length: size }, () => Array(size).fill(0));
        setMatrixA(newMatrixA);
        setVectorB(Array(size).fill(0)); // Initialize vector b when size changes
    }, [size]);

    const getData = () => {
        Axios.get(`http://localhost:3001/${No}`).then((response) => {
            const receivedData = response.data;
            if (receivedData) {
                const parsedA = JSON.parse(receivedData.a);
                const parsedB = JSON.parse(receivedData.b);
                setMatrixA(parsedA);
                setVectorB(parsedB);
                setSize(parseInt(receivedData.n, 10)); // Assuming 'n' is the size of the matrix
            } else {
                console.error("No data found for the specified No.");
            }
        }).catch((error) => {
            console.error("Error fetching data:", error);
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
    
    const luDecomposition = () => {
        const n = size;
        const lower = Array.from({ length: n }, () => Array(n).fill(0));
        const upper = Array.from({ length: n }, () => Array(n).fill(0));

        // Decomposing the matrix into upper and lower matrices
        for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
                upper[i][j] = matrixA[i][j]; // Upper triangular matrix
                for (let k = 0; k < i; k++) {
                    upper[i][j] -= lower[i][k] * upper[k][j];
                }
            }
            for (let j = i; j < n; j++) {
                if (i === j) {
                    lower[i][i] = 1; // Diagonal as 1
                } else {
                    lower[j][i] = matrixA[j][i]; // Lower triangular matrix
                    for (let k = 0; k < i; k++) {
                        lower[j][i] -= lower[j][k] * upper[k][i];
                    }
                    lower[j][i] /= upper[i][i]; // Divide by the pivot element
                }
            }
        }

        setLowerMatrix(lower);
        setUpperMatrix(upper);
        calculateSolution(lower, upper); // Call function to calculate x
        setShowOutput(true);
    };

    const calculateSolution = (lower, upper) => {
        const n = size;
        const y = Array(n).fill(0);
        const x = Array(n).fill(0);

        // Forward substitution to solve Ly = b
        for (let i = 0; i < n; i++) {
            y[i] = vectorB[i];
            for (let j = 0; j < i; j++) {
                y[i] -= lower[i][j] * y[j];
            }
        }

        // Backward substitution to solve Ux = y
        for (let i = n - 1; i >= 0; i--) {
            x[i] = y[i];
            for (let j = i + 1; j < n; j++) {
                x[i] -= upper[i][j] * x[j];
            }
            x[i] /= upper[i][i]; // Divide by the pivot element
        }

        setSolutionX(x); // Set the solution vector x
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
            <h2>LU Decomposition</h2>
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
                        <Button variant="dark" onClick={luDecomposition}>Calculate LU Decomposition</Button>
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
                    <h4>Upper Triangular Matrix [U]</h4>
                    <Table striped bordered hover variant="dark">
                        <tbody>
                            {upperMatrix.map((row, rowIndex) => (
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

export default Lu;
