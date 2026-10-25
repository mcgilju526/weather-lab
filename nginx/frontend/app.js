async function testApi() {

    const result = document.getElementById("result");

    try {

        const response = await fetch("/api/test");

        const data = await response.json();

        result.textContent = JSON.stringify(data, null, 2);

    } catch (error) {

        result.textContent = "Error: " + error;

    }
}
