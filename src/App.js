import React, { Component } from "react";
import "./App.css";

const formatNumber = number => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

class App extends Component {
  state = { products: null, filter: '' }

  inputHandler = (e) => {
    this.setState({ filter: e.target.value });
  }

  getData(fileName) {
    return fetch(`api/${fileName}.json`).then((response) => response.json());
  }

  getAggregatedProducts(products, filter) {
    const sumProducts = {};

    products.forEach((item) => {
      if (filter && new RegExp(filter, 'i').test(item.name) === false) {
        return;
      }

      if (!sumProducts[item.id]) {
        sumProducts[item.id] = {...item}
      } else {
        sumProducts[item.id].sold += item.sold;
      }
    });

    const sumProductsArray = Object.values(sumProducts);

    sumProductsArray.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

    return sumProductsArray;
  }

  renderRows(products) {
    return products.map((item) => (
      <tr key={item.name}>
        <td>{item.name}</td>
        <td>{formatNumber(item.sold * item.unitPrice)}</td>
      </tr>
    ));
  }

  componentDidMount() {
    Promise.all([
      this.getData('branch1'),
      this.getData('branch2'),
      this.getData('branch3'),
    ]).then((data) => {
      this.setState({ products: [...data[0].products, ...data[1].products, ...data[2].products] });
    });
  }

  render() {
    if (this.state.products === null) {
      return "Loading..."
    }

    const products = this.getAggregatedProducts(this.state.products, this.state.filter);
    const rows = this.renderRows(products);
    const total = products.reduce((total, item) => total + (item.sold * item.unitPrice), 0)

    return (
      <section className="product-list">
        <input type="text" onChange={this.inputHandler} />
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{formatNumber(total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    );
  }
}

export default App;
