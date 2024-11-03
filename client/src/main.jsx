import { StrictMode, useState } from 'react'; 
import { createRoot } from 'react-dom/client';
import './index.css';
import Bisection from './Bisection.jsx';
import Gaphical from './Gaphical.jsx';
import Falseposition from './Falseposition.jsx';
import Onepoint from './Onepoint.jsx';
import Taylor from './Taylor.jsx';
import Secant from './Secant.jsx';
import Camer from './Camer.jsx';
import GaussElimination from './GaussElimination.jsx';
import GaussJordan from './GaussJordan.jsx';
import MatrixInversion from './MatrixInversion.jsx';
import Lu from './Lu.jsx';
import CholeskyDecomposition from './CholeskyDecomposition.jsx';
import Jacobi from './Jacobi.jsx';
import GaussSeidel from './GaussSeidel.jsx';
import Conjugate from './Conjugate.jsx';
import Newton from './Newton.jsx';
import Lagrange from './Lagrange.jsx';
import Spline from './spline1.jsx';
import LinearRegession from './LinearRegession.jsx';
import PolyRegession from './PolyRegession.jsx';

const App = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  const exercises = [
    { title: 'Gaphical', component: <Gaphical /> }
    ,{ title: 'Bisection', component: <Bisection /> }
    ,{ title: 'Falseposition', component: <Falseposition />}
    ,{ title: 'Onepoint', component: <Onepoint />}
    ,{ title: 'Taylor', component: <Taylor />}
    ,{ title: 'Secant', component: <Secant />}
    ,{ title: 'Camer', component: <Camer />}
    ,{ title: 'GaussElimination', component: <GaussElimination />}
    ,{ title: 'GaussJordan', component: <GaussJordan />}
    ,{ title: 'MatrixInversion', component: <MatrixInversion />}
    ,{ title: 'Lu', component: <Lu />}
    ,{ title: 'CholeskyDecomposition', component: <CholeskyDecomposition />}
    ,{ title: 'Jacobi', component: <Jacobi />}
    ,{ title: 'GaussSeidel', component: <GaussSeidel />}
    ,{ title: 'Conjugate', component: <Conjugate />}
    ,{ title: 'Newton', component: <Newton />}
    ,{ title: 'Lagrange', component: <Lagrange />}
    ,{ title: 'Spline', component: <Spline />}
    ,{ title: 'LinearRegession', component: <LinearRegession />}
    ,{ title: 'PolyRegession', component: <PolyRegession />}
    
  ];

  const handleExerciseSelection = (exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="App">
      <div className="menu-box">
        <div className="menu-bar">
          {exercises.map((exercise, index) => (
            <button
              key={index}
              onClick={() => handleExerciseSelection(exercise)}
              className={selectedExercise === exercise ? 'active' : ''}
            >
              {exercise.title}
            </button>
          ))}
        </div>
      </div>
      <div className="main-box">
        <div className="content">
          {selectedExercise ? selectedExercise.component : <h2>Please select method</h2>}
        </div>
      </div>
    </div>
  );
};

// Ensure to create a root element for the React app
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
