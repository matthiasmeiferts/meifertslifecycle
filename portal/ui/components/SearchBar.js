export default class SearchBar {

    static create({
        placeholder = "Search…",
        onSearch = null
    } = {}) {
        const wrapper = document.createElement("div");
        wrapper.className = "search-bar";

        wrapper.innerHTML = `
            <input type="search" placeholder="${placeholder}">
        `;

        const input = wrapper.querySelector("input");

        input.addEventListener("input", event => {
            if (typeof onSearch === "function") {
                onSearch(event.target.value);
            }
        });

        return wrapper;
    }

}