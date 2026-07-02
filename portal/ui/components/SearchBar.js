export default class SearchBar {

    static create({
        placeholder = "Search…",
        value = "",
        buttonLabel = "",
        onSearch = null
    } = {}) {
        const wrapper = document.createElement("div");
        wrapper.className = "search-bar";

        wrapper.innerHTML = `
            <form class="search-bar__form">
                <input type="search" placeholder="${placeholder}" value="${value}">
                ${buttonLabel ? `<button type="submit">${buttonLabel}</button>` : ""}
            </form>
        `;

        const form = wrapper.querySelector("form");
        const input = wrapper.querySelector("input");

        const runSearch = () => {
            if (typeof onSearch === "function") {
                onSearch(input.value);
            }
        };

        if (buttonLabel) {
            form.addEventListener("submit", event => {
                event.preventDefault();
                runSearch();
            });
        } else {
            input.addEventListener("input", runSearch);
        }

        return wrapper;
    }

}
