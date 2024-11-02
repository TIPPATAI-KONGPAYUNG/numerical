import { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const Bisection = () => {
    const [data, setData] = useState([]);
    const [firstResult, setFirstResult] = useState(null);
    const [Equation, setEquation] = useState('');
    const [X, setX] = useState(0);
    const [XL, setXL] = useState('');
    const [XR, setXR] = useState(''); 
    const [No, setNo] = useState(2); 

    useEffect(() => {
        getData();
    }, [No]);

    const getData = () => {
        Axios.get(`http://localhost:3001/${No}`)
            .then((response) => {
                const receivedData = response.data;
                if (receivedData) {
                    setEquation(receivedData.equation); 
                    setXL(receivedData.xl);
                    setXR(receivedData.xr);
                } else {
                    console.error("No data found for the specified No.");
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    const updateData = () => {
        Axios.put(`http://localhost:3001/update/${No}`, {
            equation: Equation.toString(), 
            xl: XL.toString(),
            xr: XR.toString()
        }).then(() => {
            console.log("Data updated successfully");
        }).catch((error) => {
            console.error("Error updating data:", error);
        });
    };

    const handleEquationChange = (e) => {
        setEquation(e.target.value);
        updateData();
    };

    const handleXLChange = (e) => {
        setXL(e.target.value);
        updateData();
    };

    const handleXRChange = (e) => {
        setXR(e.target.value);
        updateData();
    };

    const calculateError = (oldX, newX) => Math.abs((newX - oldX) / newX) * 100;

    const calculateBisection = (xl, xr) => {
        let xm, ea;
        let iter = 0;
        const MAX = 50;
        const e = 0.00001;
        const newData = [];
    
        do {
            xm = (xl + xr) / 2.0;
            try {
                const fXl = evaluate(Equation, { x: xl });
                const fXr = evaluate(Equation, { x: xr });
                const fXm = evaluate(Equation, { x: xm });
                iter++;
                ea = calculateError(xl, xm);
    
                newData.push({ iteration: iter, Xl: xl, Xm: xm, Xr: xr, Error: ea });
    
                if (fXm * fXr > 0) {
                    xr = xm;
                } else {
                    xl = xm;
                }
            } catch (error) {
                console.error("Error evaluating the equation:", error);
                return; // Exit if the evaluation fails
            }
        } while (ea > e && iter < MAX);
    
        setData(newData);
        setX(xm);
        if (firstResult === null) setFirstResult(xm);
    };
    
    const calculateRoot = () => {
        const xlnum = parseFloat(XL);
        const xrnum = parseFloat(XR);
        if (isNaN(xlnum) || isNaN(xrnum)) {
            alert("Please enter valid numbers for XL and XR.");
            return;
        }
    
        calculateBisection(xlnum, xrnum);
    };
    
    return (
        <Container>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Input f(x)</Form.Label>
                    <input type="text" value={Equation} onChange={handleEquationChange} style={{ width: "100%", margin: "0 auto" }} className="form-control" />
                    <br />
                    <Form.Label>Input XL</Form.Label>
                    <input type="number" value={XL} onChange={handleXLChange} style={{ width: "30%", margin: "0 auto" }} className="form-control" />
                    <Form.Label>Input XR</Form.Label>
                    <input type="number" value={XR} onChange={handleXRChange} style={{ width: "30%", margin: "0 auto" }} className="form-control" />
                </Form.Group>
                <Button variant="dark" onClick={calculateRoot}>
                    Calculate
                </Button>
            </Form>
            <br />
            <>
                <h5>Answer = {X.toPrecision(7)}</h5>
                {firstResult !== null && <h5>First Result = {firstResult.toPrecision(7)}</h5>}
            </>
            <Container>
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th width="10%">Iteration</th>
                            <th width="30%">XL</th>
                            <th width="30%">XM</th>
                            <th width="30%">XR</th>
                            <th width="30%">Error (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((element, index) => (
                            <tr key={index}>
                                <td>{element.iteration}</td>
                                <td>{element.Xl}</td>
                                <td>{element.Xm}</td>
                                <td>{element.Xr}</td>
                                <td>{element.Error.toFixed(6)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </Container>
    );
};

export default Bisection;
