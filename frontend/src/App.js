import logo from './logo.svg';
import React from "react";
import './App.css';
import useWeb3Modal from "./hooks/useWeb3Modal";
import { Body, Button, Header, Image, Link } from "./components";

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
      <Button
          onClick={() => {
            if (!provider) {
              loadWeb3Modal();
            } else {
              logoutOfWeb3Modal();
            }
          }}
      >
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  return (
      <div>
        <Header>
          <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Header>
        <Body>
        </Body>
      </div>
  );
}

/**
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
**/

export default App;
