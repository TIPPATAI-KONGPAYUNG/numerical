import React, { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const SecantMethod = () => {
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [initialGuess1, setInitialGuess1] = useState(2); // First initial guess
  const [initialGuess2, setInitialGuess2] = useState(3); // Second initial guess
  const [equation, setEquation] = useState("(x ^2) -7");
  const [errorMessage, setErrorMessage] = useState("");
  const [no, setNo] = useState(7); // Set your key value here
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    getData();
  }, [no]);

  useEffect(() => {
    if (initialData.equation !== equation || initialData.xl !== initialGuess1 || initialData.xr !== initialGuess2) {
      updateData();
    }
  }, [equation, initialGuess1, initialGuess2]);

  const getData = () => {
    Axios.get(`http://localhost:3001/${no}`)
      .then((response) => {
        if (response.data.length > 0) {
          const receivedData = response.data[0];
          setEquation(receivedData.equation);
          setInitialGuess1(receivedData.xl);
          setInitialGuess2(receivedData.xr);
          setInitialData(receivedData);
        } else {
          console.error("No data found for the specified No.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const updateData = () => {
    Axios.put(`http://localhost:3001/update/${no}`, {
      equation: equation,
      xl: initialGuess1,
      xr: initialGuess2
    })
      .then(() => {
        console.log("Data updated successfully");
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  };

  const g = (xVal) => {
    try {
      return evaluate(equation, { x: xVal });
    } catch (error) {
      alert("Invalid equation. Please check your input.");
      return 0;
    }
  };

  const calculateRoot = () => {
    let x0 = parseFloat(initialGuess1);
    let x1 = parseFloat(initialGuess2);
    const maxIterations = 100; 
    const tolerance = 0.000001;
    const newData = [];
    let iter = 0;

    while (iter < maxIterations) {
      const fx0 = g(x0);
      const fx1 = g(x1);

      console.log(`Iteration ${iter}: x0 = ${x0}, fx0 = ${fx0}, x1 = ${x1}, fx1 = ${fx1}`); // Debug info

      if (fx1 - fx0 === 0) {
        setErrorMessage("Error: Division by zero. Adjust your guesses.");
        return;
      }

      const x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0); // Secant formula
      newData.push({ iteration: iter + 1, x0, x1, x2 });

      if (Math.abs(x2 - x1) < tolerance) {
        setResult({ x: x2 });
        setData(newData);
        setErrorMessage("");
        return;
      }

      x0 = x1;
      x1 = x2;
      iter++;
    }

    setResult(null);
    setErrorMessage("Maximum iterations reached without finding a root.");
    setData(newData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "initialGuess1") setInitialGuess1(value);
    if (name === "initialGuess2") setInitialGuess2(value);
  };

  const handleEquationChange = (e) => {
    setEquation(e.target.value);
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
          <Form.Label>x₀</Form.Label>
          <input
            type="number"
            name="initialGuess1"
            value={initialGuess1}
            onChange={handleInputChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
            step="0.1"
          />
          <Form.Label>x₁</Form.Label>
          <input
            type="number"
            name="initialGuess2"
            value={initialGuess2}
            onChange={handleInputChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
            step="0.1"
          />
        </Form.Group>
        <Button variant="dark" onClick={calculateRoot}>
          Calculate
        </Button>
      </Form>
      <br />
      <h5>
        {result
          ? `Solution found at x = ${result.x.toFixed(6)}`
          : errorMessage ? errorMessage : "Calculating..."}
      </h5>
      <Container>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Iteration</th>
              <th>x₀</th>
              <th>x₁</th>
              <th>x₂</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.iteration}</td>
                <td>{item.x0.toFixed(6)}</td>
                <td>{item.x1.toFixed(6)}</td>
                <td>{item.x2.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Container>
  );
};

export default SecantMethod;
