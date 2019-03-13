import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import registryData from './registryData';
import userData from '../../userData';

class App extends Component {
  createTable = () => {
    let table = []

    // Outer loop to create parent
    for (const rowData of registryData) {
      let children = []

      // Dance Move
      children.push(<td>{rowData.movename} <a href={process.env.PUBLIC_URL + `${rowData.moveid}.0.webm`}>(Video)</a></td>)

      // Owner
      children.push(<td>{rowData.username}</td>)

      // For Sale
      let forSale = ""
      if (rowData.islisted) {
        forSale = `${rowData.buyprice} MVP`
      }
      children.push(<td>{forSale}</td>)

      //Create the parent and add the children
      table.push(<tr>{children}</tr>)
    }
    return table
  }

  createUserTable = () => {
    let table = []

    // Outer loop to create parent
    for (const rowData of userData) {
      let children = []

      // Dance Move
      children.push(<td>{rowData.movename} <a href={process.env.PUBLIC_URL + `${rowData.moveid}.0.webm`}>(Video)</a></td>)

      // Owner
      children.push(<td>{rowData.username}</td>)

      // For Sale
      let forSale = ""
      if (rowData.islisted) {
        forSale = `${rowData.buyprice} MVP`
      }
      children.push(<td>{forSale}</td>)

      //Create the parent and add the children
      table.push(<tr>{children}</tr>)
    }
    return table
  }

  render() {
    return (
      <div className="App">
        <img src={process.env.PUBLIC_URL + "/mover-prover.gif"} width={600}/>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Dance Move</th>
              <th>Owner</th>
              <th>For Sale</th>
            </tr>
          </thead>
          <tbody>
            {this.createTable()}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default App;
