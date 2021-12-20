import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./Landing";
import Products from "./Products";
import About from "./About";
import Contact from "./Contact";
import 'bootstrap/dist/css/bootstrap.min.css';
// import NavbarComp from "./components/NavbarComp.js";

function App() {
  return (
    <Router>
    <div>
      {/* <NavbarComp/> */}
     <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/products" component={Products} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
     </Switch>
    </div>
    </Router>
  );
}

export default App;
