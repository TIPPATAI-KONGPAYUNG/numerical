import React, { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const SecantMethod = () => {
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [initialGuess1, setInitialGuess1] = useState();
  const [initialGuess2, setInitialGuess2] = useState(); 
  const [equation, setEquation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [no, setNo] = useState(6); 

  useEffect(() => {
    getData();
  }, [no]);

  const getData = () => {
    Axios.get(`http://localhost:3001/${no}`)
        .then((response) => {
            const receivedData = response.data;
            if (receivedData) {
                setEquation(receivedData.equation); 
                setInitialGuess1(receivedData.x1);
                setInitialGuess2(receivedData.x2);
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
      equation: equation.toString(),
      xl: initialGuess1.toString(),
      xr: initialGuess2.toString()
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

  const handleInput1Change = (e) => {
    setInitialGuess1(e.target.value);
    updateData();
  };
  
  const handleInput2Change = (e) => {
    setInitialGuess2(e.target.value);
    updateData();
  };

  const handleEquationChange = (e) => {
    setEquation(e.target.value);
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
          <Form.Label>x₀</Form.Label>
          <input
            type="number"
            name="initialGuess1"
            value={initialGuess1}
            onChange={handleInput1Change}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
            step="0.1"
          />
          <Form.Label>x₁</Form.Label>
          <input
            type="number"
            name="initialGuess2"
            value={initialGuess2}
            onChange={handleInput2Change}
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
