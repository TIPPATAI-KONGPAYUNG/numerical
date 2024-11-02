import React, { useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';

const TaylorSeriesLnX = () => {
  const [results, setResults] = useState([]);

  const calculateTaylorSeries = () => {
    const x = 4;
    const x0 = 2;
    const lnX = Math.log(x);
    const lnX0 = Math.log(x0);

    const errors = [];
    let P0 = lnX0; // n = 0
    let error0 = Math.abs(lnX - P0);
    errors.push({ n: 0, error: error0 });

    let P1 = lnX0 + (1 / x0) * (x - x0); // n = 1
    let error1 = Math.abs(lnX - P1);
    errors.push({ n: 1, error: error1 });

    let P2 = lnX0 + (1 / x0) * (x - x0) - (1 / (2 * Math.pow(x0, 2))) * Math.pow(x - x0, 2); // n = 2
    let error2 = Math.abs(lnX - P2);
    errors.push({ n: 2, error: error2 });

    let P3 = lnX0 + (1 / x0) * (x - x0) - (1 / (2 * Math.pow(x0, 2))) * Math.pow(x - x0, 2) + (1 / (6 * Math.pow(x0, 3))) * Math.pow(x - x0, 3); // n = 3
    let error3 = Math.abs(lnX - P3);
    errors.push({ n: 3, error: error3 });

    setResults(errors);
  };

  return (
    <Container>
      <h1>Taylor Series for f(x) = ln(x) at x = 4</h1>
      <Button variant="primary" onClick={calculateTaylorSeries}>
        Calculate Taylor Series
      </Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>N</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.n}>
              <td>{result.n}</td>
              <td>{result.error.toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default TaylorSeriesLnX;
