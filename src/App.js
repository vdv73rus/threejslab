import React, { Component } from 'react';
import './App.css';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import OrbitControls from 'three-orbitcontrols';

const loader = new GLTFLoader();

class App extends Component {
  state = {
    color: '0000ff',
    tire: true,
    rim: true
  }

  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.clock = new THREE.Clock();

    //ADD SCENE
    this.scene = new THREE.Scene();
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.z = 1

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setClearColor('#fff')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    //TRACK CONTROL
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.minPolarAngle = Math.PI / 2;
    this.orbitControls.enableZoom = false;

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    this.scene.add(hemisphereLight);

    loader.load('http://localhost:8000/scene.gltf', gltf => {

      this.carModel = gltf.scene.children[0];
      this.carModel.translateZ(-0.5);
      // this.carModel.traverse(child => {
      //   if (child.isMesh && child.visible) {
      //     console.log(child);
      //     if (child.material.color.r === 0 && child.material.color.g === 0 && child.material.color.b === 1) {
      //       this.materials.push(child.material.name);
      //     }
      //   }
      // });

      this.scene.add(gltf.scene);
    }, undefined, function (error) {
      console.error({ error });
    });

    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    const delta = this.clock.getDelta();
    this.orbitControls.update(delta);
    this.renderer.render(this.scene, this.camera)
  }

  handleColorChange = color => () => {
    this.setState({ color }, () => {
      this.carModel.traverse(child => {
        if (child.isMesh && child.userData.colored) {
          child.material.color.setHex(`0x${color}`);
        }
      });
    })
  }

  handleCheckboxChange = type => e => {

    if (e.target.checked) {
      this.handleShowParts(type);
    } else {
      this.handleHideParts(type);
    }
  }

  handleHideParts = type => {
    this.setState({ [type]: false }, () => {
      this.carModel.traverse(child => {
        if (child.isMesh && child.userData.type && child.userData.type === type) {
          child.visible = false;
        }
      });
    })
  }

  handleShowParts = type => {
    this.setState({ [type]: true }, () => {
      this.carModel.traverse(child => {
        if (child.isMesh && child.userData.type && child.userData.type === type) {
          child.visible = true;
        }
      });
    })
  }

  render() {
    const { color, tire, rim } = this.state;

    return (
      <div className="App">
        <div className="App-content">
          <div
            className="App-model"
            style={{ width: '600px', height: '400px' }}
            ref={(mount) => { this.mount = mount }}
          />
          <div>
            <div className="App-colors">
              <label>
                <input checked={color === "aaa9aa"} type="radio" name="color" onChange={this.handleColorChange('aaa9aa')} />
                <span className="App-color" style={{ backgroundColor: "#aaa9aa" }}></span>
                <span>Pearl White Multi-Coat</span>
              </label>
              <label>
                <input checked={color === "8b0018"} type="radio" name="color" onChange={this.handleColorChange('8b0018')} />
                <span className="App-color" style={{ backgroundColor: "#8b0018" }}></span>
                <span>Red Multi-Coat</span>
              </label>
              <label>
                <input checked={color === "0000ff"} type="radio" name="color" onChange={this.handleColorChange('0000ff')} />
                <span className="App-color" style={{ backgroundColor: "#0000ff" }}></span>
                <span>Deep Blue</span>
              </label>
            </div>

            <div className="App-parts">
              <label>
                <input type="checkbox" checked={tire} onChange={this.handleCheckboxChange('tire')} />
                <span>Show Tires</span>
              </label>
              <label>
                <input type="checkbox" checked={rim} onChange={this.handleCheckboxChange('rim')} />
                <span>Show Rims</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;