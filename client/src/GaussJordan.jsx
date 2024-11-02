import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Table } from 'react-bootstrap';
import Axios from 'axios';

const GaussJordan = () => {
    const [row, setRow] = useState(0);
    const [column, setColumn] = useState(0);
    const [matrixA, setMatrixA] = useState([]);
    const [matrixB, setMatrixB] = useState([]);
    const [answer, setAnswer] = useState([]);
    const [showOutput, setShowOutput] = useState(false);
    const [No, setNo] = useState(9); 

    useEffect(() => {
        getData();
    }, [No]);

    useEffect(() => {
        const newMatrixA = Array.from({ length: row }, () => Array(column).fill(0));
        const newMatrixB = Array(row).fill(0);
        setMatrixA(newMatrixA);
        setMatrixB(newMatrixB);
    }, [row, column]);

    const getData = () => {
        Axios.get(`http://localhost:3001/${No}`).then((response) => {
            const receivedData = response.data;
            if (receivedData) {
                const parsedA = JSON.parse(receivedData.a);
                const parsedB = JSON.parse(receivedData.b);
                
                setMatrixA(parsedA);
                setMatrixB(parsedB);
                setRow(parseInt(receivedData.n, 10));
                setColumn(parseInt(receivedData.m, 10));
            } else {
                console.error("No data found for the specified No.");
            }
        }).catch((error) => {
            console.error("Error fetching data:", error);
        });
    };

    const updateData = () => {
        Axios.put(`http://localhost:3001/update/${No}`, {
            n: row.toString(),
            m: column.toString(),
            a: JSON.stringify(matrixA),
            b: JSON.stringify(matrixB)
        }).then(() => {
            console.log("Data updated successfully");
        }).catch((error) => {
            console.error("Error updating data:", error);
        });
    };

    const handleInputChangeA = (i, j, value) => {
        const newMatrix = [...matrixA];
        newMatrix[i][j] = parseFloat(value);
        setMatrixA(newMatrix);
        updateData();
    };

    const handleInputChangeB = (i, value) => {
        const newMatrixB = [...matrixB];
        newMatrixB[i] = parseFloat(value);
        setMatrixB(newMatrixB);
        updateData();
    };

    const gaussJordan = () => {
        const augmentedMatrix = matrixA.map((row, i) => [...row, matrixB[i]]);
        const n = augmentedMatrix.length;
        const m = augmentedMatrix[0].length;

        for (let i = 0; i < n; i++) {
            // Make the diagonal contain all 1's
            const divisor = augmentedMatrix[i][i];
            for (let j = 0; j < m; j++) {
                augmentedMatrix[i][j] /= divisor;
            }

            // Make the other rows contain 0's in the current column
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = augmentedMatrix[k][i];
                    for (let j = 0; j < m; j++) {
                        augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
                    }
                }
            }
        }

        // Extract the solution
        const results = augmentedMatrix.map(row => row[m - 1]);
        const formattedAnswer = results.map((value, index) => ({
            variable: `x${index + 1}`,
            value: value.toFixed(4),
        }));

        setAnswer(formattedAnswer);
        setShowOutput(true);
    };

    return (
        <Container>
            <h2>Gauss Jordan Method</h2>
            <Form>
                <Form.Group>
                    <Form.Label>Row</Form.Label>
                    <Form.Control
                        type="number"
                        value={row}
                        onChange={(e) => setRow(parseInt(e.target.value) || 0)}
                    />
                    <Form.Label>Column</Form.Label>
                    <Form.Control
                        type="number"
                        value={column}
                        onChange={(e) => setColumn(parseInt(e.target.value) || 0)}
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
                                        onChange={(e) => handleInputChangeA(i, j, e.target.value)}
                                        style={{ width: '60px', marginRight: '5px' }}
                                    />
                                ))}
                            </div>
                        ))}
                        <h4>Vector [B]</h4>
                        {matrixB.map((value, i) => (
                            <Form.Control
                                key={`b${i}`}
                                type="number"
                                value={value}
                                onChange={(e) => handleInputChangeB(i, e.target.value)}
                                style={{ width: '60px', marginBottom: '5px' }}
                            />
                        ))}
                        <Button variant="dark" onClick={gaussJordan}>Calculate</Button>
                    </div>
                )}
            </Form>
            {showOutput && (
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answer.map((ans, index) => (
                            <tr key={index}>
                                <td>{ans.variable}</td>
                                <td>{ans.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default GaussJordan;
