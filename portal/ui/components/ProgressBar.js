export default class ProgressBar {

    static create(value = 0) {

        const progress = Math.max(0, Math.min(100, value));

        const wrapper = document.createElement("div");
        wrapper.className = "progress-bar";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = `${progress}%`;

        wrapper.appendChild(fill);

        return wrapper;

    }

}