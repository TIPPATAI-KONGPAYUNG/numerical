import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import Axios from 'axios';
import { matrix, multiply, transpose, inv } from 'mathjs';

const PolynomialRegression = () => {
    const [size, setSize] = useState(0);
    const [x, setX] = useState([]);
    const [y, setY] = useState([]);
    const [coefficients, setCoefficients] = useState(null); 
    const [prediction, setPrediction] = useState(null); 
    const [error, setError] = useState(null); 
    const [xin, setXin] = useState(''); 
    const [No, setNo] = useState(20); 
    const [degree, setDegree] = useState(2); 

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
                    const parsedM = JSON.parse(receivedData.m);
                    setSize(parsedX.length); 
                    setX(parsedX);  
                    setY(parsedY);  
                    setDegree(parsedM);
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
            m: degree.toString(),
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

    const handleMChange = (e) => {
        const numPoints = parseInt(e.target.value);
        setDegree(numPoints);
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

    const calculatePolynomialRegression = () => {
        if (size < degree + 1) {
            setError(`At least ${degree + 1} points are required for degree-${degree} polynomial regression.`);
            return;
        }

        const X = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j <= degree; j++) {
                row.push(Math.pow(x[i], j));
            }
            X.push(row);
        }

        const Y = matrix(y);
        if (Y.size()[0] !== size) {
            setError("Y vector size does not match number of points.");
            return;
        }

        const XT = transpose(matrix(X)); 
        const XTX = multiply(XT, matrix(X)); // X^T * X
        const XTY = multiply(XT, Y); // X^T * Y

        try {
            const coefficients = multiply(inv(XTX), XTY).toArray();
            setCoefficients(coefficients);
            setError(null);
        } catch (error) {
            setError("Error calculating polynomial regression: " + error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        calculatePolynomialRegression();
    };

    const handlePrediction = () => {
        const xinValue = parseFloat(xin);
        if (isNaN(xinValue) || !coefficients) {
            setError("Enter a valid X value and calculate regression first.");
            return;
        }

        // Calculate y = a0 + a1*x + a2*x^2 + ... + an*x^n
        let predictedY = 0;
        for (let i = 0; i < coefficients.length; i++) {
            predictedY += coefficients[i] * Math.pow(xinValue, i);
        }
        setPrediction(predictedY);
    };

    return (
        <Container>
            <h2>Polynomial Regression</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Degree of Polynomial</Form.Label>
                    <Form.Control
                        type="number"
                        value={degree}
                        onChange={handleMChange}
                        min="1"
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Number of Points (n)</Form.Label>
                    <Form.Control
                        type="number"
                        value={size}
                        onChange={handleNChange}
                        min={degree + 1}
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

            {coefficients && (
                <div className="mt-4">
                    <h4>Regression Equation:</h4>
                    <p>
                        f(x) = {coefficients.map((coef, i) => `${coef.toFixed(4)}x^${i}`).join(" + ")}
                    </p>
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

export default PolynomialRegression;
