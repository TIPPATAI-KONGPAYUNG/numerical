import React, { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const FalsePosition = () => {
  const [data, setData] = useState([]);
  const [firstResult, setFirstResult] = useState(null);
  const [equation, setEquation] = useState("x^4 - 13");
  const [xl, setXL] = useState("1.5");
  const [xr, setXR] = useState("2");
  const [no, setNo] = useState(3); // Key value for fetching data

  useEffect(() => {
    getData();
  }, [no]);

  useEffect(() => {
    updateData();
  }, [equation, xl, xr]); // Update data on equation or bounds change

  // Fetch data from API
  const getData = async () => {
    try {
      const response = await Axios.get(`http://localhost:3001/${no}`);
      if (response.data.length > 0) {
        const { equation: fetchedEquation, xl: fetchedXL, xr: fetchedXR } = response.data[0];
        setEquation(fetchedEquation);
        setXL(fetchedXL);
        setXR(fetchedXR);
      } else {
        console.error("No data found for the specified No.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Update data on the server
  const updateData = async () => {
    try {
      await Axios.put(`http://localhost:3001/update/${no}`, {
        equation,
        xl,
        xr
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

    // Check if function values at the boundaries have different signs
    if (f(xlNum) * f(xrNum) > 0) {
      alert("f(xL) and f(xR) must have different signs.");
      return;
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      xM = (xlNum * f(xrNum) - xrNum * f(xlNum)) / (f(xrNum) - f(xlNum));
      const fxM = f(xM);

      // Check if function evaluation was successful
      if (fxM === null) {
        alert("Error evaluating the function at X_M. Please check the equation.");
        return;
      }

      newData.push({ iteration: iter + 1, xl: xlNum, xr: xrNum, xm: xM, fxm: fxM });

      if (Math.abs(fxM) < tolerance) {
        setData(newData);
        setFirstResult(xM); // Save result on convergence
        return;
      }

      // Adjusting intervals based on function signs
      if (fxM * f(xlNum) < 0) {
        xrNum = xM; 
      } else {
        xlNum = xM; 
      }
    }

    setData(newData);
    setFirstResult(xM); // Final result if not converged
  };

  // Handle the calculation when the button is clicked
  const calculateRoot = () => {
    const xlNum = parseFloat(xl);
    const xrNum = parseFloat(xr);
    if (isNaN(xlNum) || isNaN(xrNum)) {
      alert("Please enter valid numbers for X_L and X_R.");
      return;
    }

    calculateFalsePosition(xlNum, xrNum);
  };

  // Update input values
  const handleInputChange = (setter) => (event) => setter(event.target.value);

  return (
    <Container>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Input f(x)</Form.Label>
          <input
            type="text"
            value={equation}
            onChange={handleInputChange(setEquation)}
            style={{ width: "100%", margin: "0 auto" }}
            className="form-control"
          />
          <br />
          <Form.Label>Input X_L</Form.Label>
          <input
            type="number"
            value={xl}
            onChange={handleInputChange(setXL)}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
          />
          <Form.Label>Input X_R</Form.Label>
          <input
            type="number"
            value={xr}
            onChange={handleInputChange(setXR)}
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
