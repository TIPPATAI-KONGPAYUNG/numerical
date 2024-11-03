import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import Axios from 'axios';

const LinearRegression = () => {
    const [size, setSize] = useState(0);
    const [x, setX] = useState([]);
    const [y, setY] = useState([]);
    const [a0, setA0] = useState(null); 
    const [a1, setA1] = useState(null); 
    const [prediction, setPrediction] = useState(null); 
    const [error, setError] = useState(null); 
    const [xin, setXin] = useState(''); 
    const [No, setNo] = useState(19); 

    useEffect(() => {
        getData();
    }, [No]);

    useEffect(() => {
        if (size > 0) updateData();
    }, [x, y, size]);

    const getData = () => {
        Axios.get(`http://localhost:3001/${No}`)
            .then((response) => {
                const receivedData = response.data;
                if (receivedData) {
                    const parsedX = JSON.parse(receivedData.a);
                    const parsedY = JSON.parse(receivedData.b);
                    setSize(parsedX.length); 
                    setX(parsedX);  
                    setY(parsedY);  
                    setXin(receivedData.xin);
                } else {
                    setError("No data found for the specified No.");
                }
            })
            .catch((error) => {
                setError("Error fetching data: " + error.message);
            });
    };

    const updateData = () => {
        Axios.put(`http://localhost:3001/update/${No}`, {
            n: size.toString(),
            a: JSON.stringify(x),
            b: JSON.stringify(y),
            xin: xin.toString()
        }).then(() => {
            console.log("Data updated successfully");
        }).catch((error) => {
            console.error("Error updating data:", error);
        });
    };

    const handleNChange = (e) => {
        const numPoints = parseInt(e.target.value) || 0;
        setSize(numPoints);
        setX(Array(numPoints).fill(''));
        setY(Array(numPoints).fill(''));
        updateData();
    };

    const handlePointChange = (index, field, value) => {
        if (field === 'x') {
            const updatedX = [...x];
            updatedX[index] = parseFloat(value);
            setX(updatedX);
            updateData();
        } else {
            const updatedY = [...y];
            updatedY[index] = parseFloat(value);
            setY(updatedY);
            updateData();
        }
    };

    const calculateLinearRegression = () => {
        const n = size;
        if (n < 2) {
            setError("At least two points are required for linear regression.");
            return;
        }

        let sumX = 0, sumY = 0, sumX2 = 0, sumXY = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumX2 += x[i] * x[i];
            sumXY += x[i] * y[i];
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        setA0(intercept);
        setA1(slope);
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        calculateLinearRegression();
    };

    const handlePrediction = () => {
        const xinValue = parseFloat(xin);
        if (isNaN(xinValue) || a0 === null || a1 === null) {
            setError("Enter a valid X value and calculate regression first.");
            return;
        }
        const predictedY = a0 + a1 * xinValue;
        setPrediction(predictedY);
    };

    return (
        <Container>
            <h2>Linear Regression</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Number of Points (n)</Form.Label>
                    <Form.Control
                        type="number"
                        value={size}
                        onChange={handleNChange}
                        min="2"
                    />
                </Form.Group>

                {size > 0 && (
                    <div>
                        <h4>Input Points</h4>
                        {Array.from({ length: size }, (_, index) => (
                            <Row key={index} className="mb-2">
                                <Col>
                                    <Form.Control
                                        type="number"
                                        placeholder={`x${index + 1}`}
                                        value={x[index]}
                                        onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="number"
                                        placeholder={`y${index + 1}`}
                                        value={y[index]}
                                        onChange={(e) => handlePointChange(index, 'y', e.target.value)}
                                    />
                                </Col>
                            </Row>
                        ))}
                    </div>
                )}

                <Button variant="dark" type="submit">Calculate Regression</Button>
            </Form>

            {a0 !== null && a1 !== null && (
                <div className="mt-4">
                    <h4>Regression Equation: f(x) = {a0.toFixed(4)} + {a1.toFixed(4)} * x</h4>
                </div>
            )}

            <Form.Group className="mt-4">
                <Form.Label>Predict Y for X</Form.Label>
                <Form.Control
                    type="number"
                    value={xin}
                    onChange={(e) => setXin(e.target.value)}
                />
                <Button variant="dark" onClick={handlePrediction} className="mt-2">
                    Predict
                </Button>
            </Form.Group>

            {prediction !== null && (
                <div className="mt-4">
                    <h4>Predicted Y at X = {xin}: {prediction.toFixed(4)}</h4>
                </div>
            )}
        </Container>
    );
};

export default LinearRegression;
