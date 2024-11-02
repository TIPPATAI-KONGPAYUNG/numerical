import React, { useState, useEffect } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { evaluate } from 'mathjs';
import Axios from 'axios';

const OnePointIteration = () => {
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [initialGuess, setInitialGuess] = useState(1); 
  const [equation, setEquation] = useState("(x + 7 / x) / 2"); 
  const [errorMessage, setErrorMessage] = useState("");
  const [no, setNo] = useState(4); // Set your key value here
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    getData();
  }, [no]);

  useEffect(() => {
    
    if (initialData.equation !== equation || initialData.x !== initialGuess) {
      updateData();
    }
  }, [equation, initialGuess]);

  const getData = () => {
    Axios.get(`http://localhost:3001/${no}`)
      .then((response) => {
        if (response.data.length > 0) {
          const receivedData = response.data[0];
          setEquation(receivedData.equation);
          setInitialGuess(receivedData.x); 
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
      x: initialGuess
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
    let x0 = parseFloat(initialGuess);
    const maxIterations = 50; 
    const tolerance = 0.00001;
    const newData = []; 
    let iter = 0;

    while (iter < maxIterations) {
      const x1 = g(x0); 

      newData.push({ iteration: iter + 1, x0, x1 });

      if (Math.abs(x1 - x0) < tolerance) {
        setResult({ x: x1 });
        setData(newData);
        setErrorMessage(""); 
        return;
      }

      x0 = x1;
      iter++;
    }

    setResult(null);
    setErrorMessage("Maximum iterations reached without finding a root.");
    setData(newData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "initialGuess") setInitialGuess(value);
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
            name="initialGuess"
            value={initialGuess}
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
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.iteration}</td>
                <td>{item.x0.toFixed(6)}</td>
                <td>{item.x1.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Container>
  );
};

export default OnePointIteration;
