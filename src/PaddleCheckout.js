/* eslint-disable react-hooks/exhaustive-deps */
import { initializePaddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import "./PaddleCheckout.css";

export const PaddleCheckout = () => {
  // Create a local state to store Paddle instance
  const [paddle, setPaddle] = useState();
  const [showTax, setShowTax] = useState(false);

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    initializePaddle({
      environment: "sandbox",
      token: "test_ac8ea1d77a84e2f72334b454d50",
      eventCallback: updateTable,
      checkout: {
        settings: {
          displayMode: "inline",
          frameTarget: "checkout-container",
          frameInitialHeight: "450",
          frameStyle:
            "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          showAddDiscounts: false,
          showAddTaxId: false,
        },
      },
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  // Callback to open a checkout
  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId: "pri_01j1w8a16r5bnptzm9g16fg8ch", quantity: 1 }],
      customer: {
        id : "ctm_01j1w9ftgyr6gaqbwmmrry811d",
        address: {
          id : 'add_01j2by4gk2bh6rmt4pvz5nqe6g'
        }
      }
    });
  };

  function updateTable(event) {
    console.log("EVENT", event);
    if (!event.name) {
      return;
    }
    if( event.name === 'checkout.customer.created'){
      setShowTax(true);
    }
    console.log(event.data);

    let items = event.data.items;
    let totals = event.data.totals;
    let recurringTotals = event.data.recurring_totals;
    console.log(totals);
    updateItemsTable(items);
    updateSummaryTable(totals, recurringTotals);
  }

  function updateItemsTable(items) {
    const itemsTableBody = document.querySelector(".items-table tbody");
    itemsTableBody.innerHTML = "";

    items.forEach((item) => {
      const newRow = createTableRow(item.product.name, item.totals.subtotal);
      itemsTableBody.appendChild(newRow);
    });
  }

  function createTableRow(productName, total) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
    <td>${productName}</td>
    <td>${total.toFixed(2)}</td>
  `;
    return newRow;
  }

  function updateSummaryTable(totals, recurringTotals) {
    document.getElementById("oneTimeTotal").textContent = (
      totals.subtotal - recurringTotals.subtotal
    ).toFixed(2);
    document.getElementById("recurringTotal").textContent =
      recurringTotals.subtotal.toFixed(2);
    document.getElementById("taxTotal").textContent = totals.tax.toFixed(2);
    document.getElementById("totalToday").textContent = totals.total.toFixed(2);
  }

  return (
    <div className="page-container">
      <button onClick={openCheckout}>Pay service</button>
      <div className="grid">
        <div className="checkout-container"></div>
        <div>
          <table className="items-table" style={{ marginBottom: 25 }}>
            <thead>
              <tr>
                <th>Product name</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td>00.00</td>
              </tr>
            </tbody>
          </table>
          {!showTax && <>Taxes will be calculated in the next step</>}
          <div style={{ visibility: showTax ? "visible" : "hidden" }}>
            <h3>Totals</h3>
            <table role="none">
              <tbody>
                <tr>
                  <td>One-time charges</td>
                  <td id="oneTimeTotal">0.00</td>
                </tr>
                <tr>
                  <td>Recurring charges</td>
                  <td id="recurringTotal">0.00</td>
                </tr>
                <tr>
                  <td>Taxes</td>
                  <td id="taxTotal">0.00</td>
                </tr>
                <tr>
                  <td>Total today</td>
                  <td id="totalToday">0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
