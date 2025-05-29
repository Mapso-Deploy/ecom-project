import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./Landing";
import Products from "./Products";
import About from "./About";
import Contact from "./Contact";
import Explore from "./Explore";
import Blog from "./Blog";
import ProductDetail from "./components/ProductDetail";
import StagewiseIntegration from "./components/StagewiseIntegration";
import 'bootstrap/dist/css/bootstrap.min.css';
// import NavbarComp from "./components/NavbarComp.js";

function App() {
  return (
    <Router>
    <div>
      <StagewiseIntegration />
      {/* <NavbarComp/> */}
     <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/products" component={Products} />
      <Route exact path="/explore" component={Explore} />
      <Route exact path="/blog" component={Blog} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route exact path="/products/:productId" component={ProductDetail} />
     </Switch>
    </div>
    </Router>
  );
}

export default App;
