import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Products from "./Products";
import ProductsTest from "./ProductsTest"; // Three.js test implementation
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
     <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products-test" element={<ProductsTest />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
     </Routes>
    </div>
    </Router>
  );
}

export default App;
