<template>
  <div class="intro-content">
    <div class="intro-box">
      <p>
        Use the Property Data Explorer to get information about a property's
        ownership, sales history, value, and physical characteristics.
      </p>
      <p>
        <a href="https://opainquiry.phila.gov/opa.apps/help/PropInq.aspx" target="_blank" rel="noopener">Submit an official inquiry</a>
        or call OPA at <a href="tel:+12156869200">(215) 686-9200</a> if you have
        a property question, want to update information, or correct errors.
      </p>
    </div>

    <h2>To get started, you can:</h2>
    <ul class="actions-list">
      <li>
        <strong>Select a location on the map</strong><br />
        Click or tap on a specific property to view details.
      </li>
      <li>
        <strong>Search for an address</strong><br />
        Type an address or OPA account number into the search box above the map.
      </li>
      <li>
        <strong>Search by block</strong><br />
        Use the Block tab and enter a street address to find all properties on that block.
      </li>
      <li>
        <strong>Search by owner</strong><br />
        Use the Owner tab to search by owner name.
      </li>
      <li>
        <strong>Draw a shape on the map</strong><br />
        Use the Shape tab and the draw tool to find all properties in an area.
      </li>
    </ul>
  </div>
</template>

<style scoped>
.intro-box {
  background: #daedfe;
  padding: var(--spacing-m);
  border-radius: var(--border-radius-s);
  margin-bottom: var(--spacing-l);
}
.intro-box p {
  margin: 0 0 var(--spacing-s) 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}
.intro-box p:last-child {
  margin-bottom: 0;
}
.intro-content h2 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-m);
}
.actions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.actions-list li {
  padding: var(--spacing-xs) 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  border-bottom: 1px solid var(--Schemes-Outline);
}
.actions-list li:last-child {
  border-bottom: none;
}
</style>
