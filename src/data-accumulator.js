export class DataAccumulator {
  constructor() {
    this.datasetMap = {};
  }

  addData(label, data) {
    if (!this.datasetMap[label]) {
      this.datasetMap[label] = [];
    }

    this.datasetMap[label].push(data);
  }

  exportJson() {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.datasetMap))}`,
    );
    element.setAttribute('download', 'dataset.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  importJson(fileInputId) {
    const files = document.getElementById(fileInputId).files;

    if (files.length <= 0) {
      return false;
    }

    const fr = new FileReader();

    fr.onload = (e) => {
      this.datasetMap = JSON.parse(e.target.result);
    }

    fr.readAsText(files.item(0));
  }
}
