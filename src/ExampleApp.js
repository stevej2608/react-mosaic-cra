import React from "react";
import { Classes, HTMLSelect } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import dropRight from "lodash/dropRight";

import {
  Corner,
  createBalancedTreeFromLeaves,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  Mosaic,
  MosaicDirection,
  MosaicNode,
  MosaicWindow,
  MosaicZeroState,
  updateTree,
} from "react-mosaic-component";

import { CloseAdditionalControlsButton } from "./CloseAdditionalControlsButton";

import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./example.scss";

import gitHubLogo from "./GitHub-Mark-Light-32px.png";

import npm_package from "../package.json";

let windowCount = 3;

export const THEMES = {
  ["Blueprint"]: "mosaic-blueprint-theme",
  ["Blueprint Dark"]: classNames("mosaic-blueprint-theme", Classes.DARK),
  ["None"]: "",
};

const additionalControls = React.Children.toArray([<CloseAdditionalControlsButton />]);

const EMPTY_ARRAY: any[] = [];

export interface ExampleAppState {
  currentNode: MosaicNode | null;
  currentTheme: Theme;
}

export class ExampleApp extends React.Component<{}, ExampleAppState> {
  constructor(props) {
    super(props);
    this.state = {
      currentNode: {
        direction: "row",
        first: 1,
        second: {
          direction: "column",
          first: 2,
          second: 3,
        },
        splitPercentage: 40,
      },
      currentTheme: "Blueprint",
    };
  }

  render() {
    return (
      <React.StrictMode>
        <div className="react-mosaic-example-app">
          {this.renderNavBar()}
          <Mosaic
            renderTile={(count, path) => (
              <MosaicWindow
                additionalControls={count === 3 ? additionalControls : EMPTY_ARRAY}
                title={`Window ${count}`}
                createNode={this.createNode}
                path={path}
                onDragStart={() => console.log("MosaicWindow.onDragStart")}
                onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
                renderToolbar={count === 2 ? () => <div className="toolbar-example">Custom Toolbar</div> : null}
              >
                <div className="example-window">
                  <h1>{`Window ${count}`}</h1>
                </div>
              </MosaicWindow>
            )}
            zeroStateView={<MosaicZeroState createNode={this.createNode} />}
            value={this.state.currentNode}
            onChange={this.onChange}
            onRelease={this.onRelease}
            className={THEMES[this.state.currentTheme]}
          />
        </div>
      </React.StrictMode>
    );
  }

  onChange = (currentNode: MosaicNode | null) => {
    this.setState({ currentNode });
  };

  onRelease = (currentNode: MosaicNode | null) => {
    console.log("Mosaic.onRelease():", currentNode);
  };

  createNode = () => ++windowCount;

  autoArrange = () => {
    const leaves = getLeaves(this.state.currentNode);

    this.setState({
      currentNode: createBalancedTreeFromLeaves(leaves),
    });
  };

  addToTopRight = () => {
    let { currentNode } = this.state;
    if (currentNode) {
      const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
      const parent = getNodeAtPath(currentNode, dropRight(path));
      const destination = getNodeAtPath(currentNode, path);
      const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : "row";

      let first: MosaicNode;
      let second: MosaicNode;
      if (direction === "row") {
        first = destination;
        second = ++windowCount;
      } else {
        first = ++windowCount;
        second = destination;
      }

      currentNode = updateTree(currentNode, [
        {
          path,
          spec: {
            $set: {
              direction,
              first,
              second,
            },
          },
        },
      ]);
    } else {
      currentNode = ++windowCount;
    }

    this.setState({ currentNode });
  };

  renderNavBar() {
    const version = npm_package.version;
    return (
      <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
        <div className={Classes.NAVBAR_GROUP}>
          <div className={Classes.NAVBAR_HEADING}>
            <a href="https://github.com/nomcopter/react-mosaic">
              REACT-MOSAIC <span className="version">v{version}</span>
            </a>
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label className={classNames("theme-selection", Classes.LABEL, Classes.INLINE)}>
            Theme:
            <HTMLSelect value={this.state.currentTheme} onChange={(e) => this.setState({ currentTheme: e.currentTarget.value })}>
              {React.Children.toArray(Object.keys(THEMES).map((label) => <option>{label}</option>))}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Example Actions:</span>
          <button className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.GRID_VIEW))} onClick={this.autoArrange}>
            Auto Arrange
          </button>
          <button className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.ARROW_TOP_RIGHT))} onClick={this.addToTopRight}>
            Add Window to Top Right
          </button>
          <a className="github-link" href="https://github.com/nomcopter/react-mosaic">
            <img src={gitHubLogo} />
          </a>
        </div>
      </div>
    );
  }
}
