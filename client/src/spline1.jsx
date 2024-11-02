import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import Axios from 'axios';

const spline = () => {
    const [size, setSize] = useState(0);
    const [x, setX] = useState([]); // Separate state for x values
    const [y, setY] = useState([]); // Separate state for y values
    const [result, setResult] = useState(null); // Result of the interpolation
    const [error, setError] = useState(null); // Error handling state
    const [xin, setXin] = useState(''); // Value for which we want to calculate interpolation
    const [No, setNo] = useState(18); // Example: setting No to fetch/update data

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
                    setSize(parsedX.length); // Set the size based on received data
                    setX(parsedX); // Set x values
                    setY(parsedY); // Set y values
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
        setX(Array(numPoints).fill('')); // Initialize x values
        setY(Array(numPoints).fill('')); // Initialize y values
        updateData(); // Update data in the database when number of points changes
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

    const calculateCubicSpline = (xin) => {
        const n = size;
        const a = y.slice();
        const h = [];
        const b = new Array(n).fill(0);
        const c = new Array(n).fill(0);
        const d = new Array(n - 1).fill(0);

        // Step 1: Calculate h values
        for (let i = 0; i < n - 1; i++) {
            h[i] = x[i + 1] - x[i];
        }

        // Step 2: Set up the system of equations
        const alpha = [0];
        for (let i = 1; i < n - 1; i++) {
            alpha[i] = (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1]);
        }

        const l = new Array(n).fill(0);
        const mu = new Array(n).fill(0);
        const z = new Array(n).fill(0);

        l[0] = 1;
        for (let i = 1; i < n - 1; i++) {
            l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
            mu[i] = h[i] / l[i];
            z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
        }

        l[n - 1] = 1;
        z[n - 1] = 0;
        for (let j = n - 2; j >= 0; j--) {
            c[j] = z[j] - mu[j] * c[j + 1];
            b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
            d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        }

        // Step 3: Find the right interval and compute the result
        for (let i = 0; i < n - 1; i++) {
            if (xin >= x[i] && xin <= x[i + 1]) {
                const dx = xin - x[i];
                return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
            }
        }

        return null; // If xin is out of bounds
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const xinValue = parseFloat(xin);
        if (isNaN(xinValue)) {
            setError("Please enter a valid X value.");
            return;
        }

        const calculatedResult = calculateCubicSpline(xinValue);
        setResult(calculatedResult);
        setError(null); // Reset error
    };

    return (
        <Container>
            <h2>Cubic Spline Interpolation</h2>
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error message */}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Number of Points (n)</Form.Label>
                    <Form.Control
                        type="number"
                        value={size}
                        onChange={handleNChange}
                        min="1"
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

                <Form.Group>
                    <Form.Label>Value of X to Interpolate (Y value at X)</Form.Label>
                    <Form.Control
                        type="number"
                        value={xin}
                        onChange={(e) => setXin(e.target.value)}
                    />
                </Form.Group>
                <Button variant="dark" type="submit">Calculate Interpolation</Button>
            </Form>

            {result !== null && (
                <div className="mt-4">
                    <h4>Interpolated Value at X = {xin}: {result.toFixed(4)}</h4>
                </div>
            )}
        </Container>
    );
};

export default spline;
