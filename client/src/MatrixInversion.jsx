import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import Axios from 'axios';

const MatrixInversion = () => {
    const [size, setSize] = useState(0);
    const [matrixA, setMatrixA] = useState([]);
    const [vectorB, setVectorB] = useState([]);
    const [inverseMatrix, setInverseMatrix] = useState([]);
    const [solutionX, setSolutionX] = useState([]);
    const [showOutput, setShowOutput] = useState(false);
    const [No, setNo] = useState(10); // Setting No = 10 for fetching data

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
                const parsedB = JSON.parse(receivedData.b); // Assuming 'b' is sent from the server
                setMatrixA(parsedA);
                setVectorB(parsedB); // Set the vector b from the received data
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

    const gaussJordanInverse = () => {
        const n = size;
        const augmentedMatrix = matrixA.map((row, i) => [...row, ...(i === row.length ? Array(n).fill(0) : Array(n).fill(0))]);

        // Creating an identity matrix
        for (let i = 0; i < n; i++) {
            augmentedMatrix[i][n + i] = 1;
        }

        // Forward elimination
        for (let i = 0; i < n; i++) {
            // Pivoting
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                    maxRow = k;
                }
            }
            [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

            // Make the diagonal contain all 1s
            const divisor = augmentedMatrix[i][i];
            if (divisor === 0) {
                console.error("Matrix is singular and cannot be inverted.");
                return;
            }
            for (let j = 0; j < 2 * n; j++) {
                augmentedMatrix[i][j] /= divisor;
            }

            // Eliminate all other entries in the current column
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = augmentedMatrix[k][i];
                    for (let j = 0; j < 2 * n; j++) {
                        augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
                    }
                }
            }
        }

        // Extracting the inverse matrix
        const inverse = augmentedMatrix.map(row => row.slice(n));
        setInverseMatrix(inverse);
        setShowOutput(true);
        
        // Calculate x = A^-1 * b
        calculateSolutionX(inverse);
    };

    const calculateSolutionX = (inverse) => {
        const solution = inverse.map(row => {
            return row.reduce((sum, value, index) => sum + value * vectorB[index], 0);
        });
        setSolutionX(solution);
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
            <h2>Matrix Inversion</h2>
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
                        <Button variant="dark" onClick={gaussJordanInverse}>Calculate Inverse and Solve Ax = b</Button>
                    </div>
                )}
            </Form>
            {showOutput && (
                <div>
                    <h4>Inverse Matrix</h4>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                {inverseMatrix.map((_, index) => (
                                    <th key={index}>Column {index + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {inverseMatrix.map((row, rowIndex) => (
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
                            {solutionX.map((value, index) => (
                                <tr key={index}>
                                    <td>X{index + 1}</td>
                                    <td>{value.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default MatrixInversion;
