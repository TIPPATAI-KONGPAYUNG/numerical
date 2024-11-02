import React, { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const FalsePosition = () => {
  const [data, setData] = useState([]);
  const [firstResult, setFirstResult] = useState(null);
  const [equation, setEquation] = useState('');
  const [xl, setXL] = useState('');
  const [xr, setXR] = useState('');
  const [no, setNo] = useState(3); 

  useEffect(() => {
    getData();
  }, [no]);

  // Fetch data from API
  const getData = () => {
    Axios.get(`http://localhost:3001/${no}`)
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

  // Update data on the server
  const updateData = async () => {
    try {
      await Axios.put(`http://localhost:3001/update/${no}`, {
        equation: equation.toString(),
        xl: xl.toString(),
        xr: xr.toString()
      });
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  // Calculate the root using False Position method
  const calculateFalsePosition = (xlNum, xrNum) => {
    let xM;
    const maxIterations = 100;
    const tolerance = 0.000001;
    const newData = [];
    
    const f = (x) => {
      try {
        return evaluate(equation, { x });
      } catch (error) {
        console.error("Error evaluating the equation:", error);
        return null; // Indicate evaluation error
      }
    };

    if (f(xlNum) * f(xrNum) > 0) {
      alert("f(xL) and f(xR) must have different signs.");
      return;
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      xM = (xlNum * f(xrNum) - xrNum * f(xlNum)) / (f(xrNum) - f(xlNum));
      const fxM = f(xM);

      if (fxM === null) {
        alert("Error evaluating the function at X_M. Please check the equation.");
        return;
      }

      newData.push({ iteration: iter + 1, xl: xlNum, xr: xrNum, xm: xM, fxm: fxM });

      if (Math.abs(fxM) < tolerance) {
        setData(newData);
        setFirstResult(xM);
        return;
      }

      if (fxM * f(xlNum) < 0) {
        xrNum = xM; 
      } else {
        xlNum = xM; 
      }
    }

    setData(newData);
    setFirstResult(xM); 
  };

  const calculateRoot = () => {
    const xlNum = parseFloat(xl);
    const xrNum = parseFloat(xr);
    if (isNaN(xlNum) || isNaN(xrNum)) {
      alert("Please enter valid numbers for X_L and X_R.");
      return;
    }

    calculateFalsePosition(xlNum, xrNum);
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

  return (
    <Container>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Input f(x)</Form.Label>
          <input
            type="text"
            value={equation}
            onChange={handleEquationChange}
            style={{ width: "100%", margin: "0 auto" }}
            className="form-control"
          />
          <br />
          <Form.Label>Input X_L</Form.Label>
          <input
            type="number"
            value={xl}
            onChange={handleXLChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
          />
          <Form.Label>Input X_R</Form.Label>
          <input
            type="number"
            value={xr}
            onChange={handleXRChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
          />
        </Form.Group>
        <Button variant="dark" onClick={calculateRoot}>
          Calculate
        </Button>
      </Form>
      <br />
      <h5>Answer = {firstResult !== null ? firstResult.toPrecision(7) : "Calculating..."}</h5>
      <Container>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Iteration</th>
              <th>X_L</th>
              <th>X</th>
              <th>X_R</th>
              <th>f(X_M)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((element, index) => (
              <tr key={index}>
                <td>{element.iteration}</td>
                <td>{element.xl}</td>
                <td>{element.xm}</td>
                <td>{element.xr}</td>
                <td>{element.fxm}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Container>
  );
};

export default FalsePosition;
