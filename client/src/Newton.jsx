import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import Axios from 'axios';

const Newton = () => {
    const [size, setSize] = useState(0);
    const [x, setX] = useState([]);  
    const [y, setY] = useState([]);  
    const [result, setResult] = useState(null);  
    const [error, setError] = useState(null);  
    const [xin, setXin] = useState('');  
    const [No, setNo] = useState(16);  

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

     
    const dividedDifferences = [];

    const calculateDividedDifference = (i, j) => {
        if (dividedDifferences[i] && dividedDifferences[i][j] !== undefined) {
            return dividedDifferences[i][j];  
        }
        if (j === 0) {
            return y[i];  
        }
        const value = (calculateDividedDifference(i + 1, j - 1) - calculateDividedDifference(i, j - 1)) / 
                      (x[i + j] - x[i]);
        
        if (!dividedDifferences[i]) {
            dividedDifferences[i] = [];
        }
        dividedDifferences[i][j] = value;
        return value;
    };

    const calculateNewtonInterpolation = (xin) => {
        let result = 0;
        const n = size;
        for (let j = 0; j < n; j++) {
            let term = calculateDividedDifference(0, j);
            for (let k = 0; k < j; k++) {
                term *= (xin - x[k]);
            }
            result += term; 
        }
        return result;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const xinValue = parseFloat(xin);
        if (isNaN(xinValue)) {
            setError("Please enter a valid X value.");
            return;
        }

        const calculatedResult = calculateNewtonInterpolation(xinValue);
        setResult(calculatedResult);
        setError(null);  
    };

    return (
        <Container>
            <h2>Newton Divided Difference Interpolation</h2>
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

export default Newton;
