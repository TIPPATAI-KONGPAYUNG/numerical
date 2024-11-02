import React, { useState, useEffect } from "react"; 
import { Button, Container, Form, Table } from "react-bootstrap"; 
import { evaluate } from 'mathjs'; 
import Axios from 'axios'; 

const Graph = () => {
  const [data, setData] = useState([]); 
  const [result, setResult] = useState(null);
  const [n, setN] = useState('');
  const [x, setX] = useState('');
  const [esp, setEsp] = useState(0.000001);
  const [equation, setEquation] = useState(''); 
  const [errorMessage, setErrorMessage] = useState("");
  const [no, setNo] = useState(1); 

  useEffect(() => {
    getData();
  }, [no]);

  const getData = () => {
    Axios.get(`http://localhost:3001/${no}`).then((response) => {
        const receivedData = response.data;
        if (receivedData) {
          setEquation(receivedData.equation); 
          setX(receivedData.x);
          setN(receivedData.n);
        }else {
          console.error("No data found for the specified No.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setErrorMessage("Error fetching data. Please try again.");
      })
      
  };

  const updateData = () => {
    Axios.put(`http://localhost:3001/update/${no}`, { 
      equation: equation.toString(), 
      x: x.toString(),
      n: n.toString()
    })
    .then(() => {
      console.log("Data updated successfully");
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
  };

  const handleEquationChange = (e) => {
    setEquation(e.target.value);
    updateData();
  };

  const handleXChange = (e) => {
    setX(e.target.value);
    updateData();
  };

  const handleNChange = (e) => {
    setN(e.target.value);
    updateData();
  };

  const f = (xVal) => {
    try {
      return evaluate(equation, { x: xVal });
    } catch (error) {
      alert("Invalid equation. Please check your input.");
      return 0;
    }
  };

  const calculateRoot = () => {
    let nVal = parseFloat(n);
    let xVal = parseFloat(x);
    let a = 1;
    let found = false;
    const currentIterations = [];
    let hasRoot = false; 

    while (true) {
      found = false;

      for (let i = xVal; i <= nVal; i += a) {
        const fx = f(i);
        const fx1 = f(i - a);

        currentIterations.push({ x: i, fx });

        if (Math.abs(fx) <= esp) {
          setResult({ x: i, fx });
          setData(currentIterations); 
          setErrorMessage(""); 
          hasRoot = true;
          console.log(`Key: ${no}, Solution found at x = ${i}, f(x) = ${fx}`);
          return;
        }

        if (fx * fx1 < 0) {
          nVal = i;
          found = true;
        }
      }

      if (found) {
        xVal = nVal - a;
      } else {
        xVal = nVal;
        nVal += 10;
      }

      if (a < esp) {
        break;
      }

      a /= 10;
    }

    if (!hasRoot) {
      setResult(null);
      setErrorMessage("No solution found within the given range or precision.");
    }

    setData(currentIterations);
  };

  return (
    <Container>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Input Equation (f(x))</Form.Label>
          <input
            type="text"
            value={equation}
            onChange={handleEquationChange}
            style={{ width: "100%", margin: "0 auto" }}
            className="form-control"
          />
          <br />
          <Form.Label>Initial X</Form.Label>
          <input
            type="number"
            name="x"
            value={x}
            onChange={handleXChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
          />
          <Form.Label>Initial N</Form.Label>
          <input
            type="number"
            name="n"
            value={n}
            onChange={handleNChange}
            style={{ width: "30%", margin: "0 auto" }}
            className="form-control"
          />
        </Form.Group>
        <Button variant="dark" onClick={calculateRoot}>
          Calculate
        </Button>
      </Form>
      <br />
      <h5>
        {result
          ? `Solution found at x = ${result.x.toFixed(6)}, f(x) = ${result.fx.toFixed(6)}`
          : errorMessage ? errorMessage : "Calculating..."}
      </h5>
      <Container>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Iteration</th>
              <th>X</th>
              <th>f(X)</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.x.toFixed(6)}</td>
                  <td>{item.fx.toFixed(6)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </Container>
  );
};

export default Graph;
