import "./css/mermaid.css";

import React, { Component, createRef } from "react";

import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

class Mermaid extends Component<MermaidProps> {
  private mermaidRef = createRef<HTMLDivElement>();

  componentDidMount() {
    // mermaid.contentLoaded();
    this.renderMermaid();
  }

  componentDidUpdate(prevProps: MermaidProps) {
    if (prevProps.chart !== this.props.chart) {
      document
        ?.getElementById("mermaid-chart")
        ?.removeAttribute("data-processed");
      // mermaid.contentLoaded();
      this.renderMermaid();
    }
  }

  renderMermaid() {
    const { chart } = this.props;

    if (this.mermaidRef.current) {
      try {
        mermaid.parse(chart);
        this.mermaidRef.current.innerHTML = chart;
        mermaid.initialize({ startOnLoad: true });
        // mermaid.init(undefined, this.mermaidRef.current);
        mermaid.run();
      } catch (error) {
        console.error("Cannot parse Mermaid chart", error);
      }
    }
  }

  handleZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (this.mermaidRef.current) {
      const scaleAmount = 0.1;
      const container = this.mermaidRef.current;
      event.preventDefault();

      let scale = Number(container.getAttribute("data-scale")) || 1;

      if (event.deltaY < 0) {
        // Zoom in
        scale += scaleAmount;
      } else {
        // Zoom out
        scale -= scaleAmount;
      }

      // Limit scale for practicality
      scale = Math.min(Math.max(0.1, scale), 5);

      container.style.transform = `scale(${scale})`;
      container.setAttribute("data-scale", scale.toString());
    }
  };

  render() {
    return (
      <div className="mermaid-container" onWheel={this.handleZoom}>
        <div id="mermaid-chart" className="mermaid" ref={this.mermaidRef}>
          {this.props.chart}
        </div>
      </div>
    );
  }
}

export default Mermaid;
