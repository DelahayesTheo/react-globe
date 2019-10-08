import React, { useEffect, useRef } from 'react';

import {
  defaultCameraOptions,
  defaultFocusOptions,
  defaultGlobeOptions,
  defaultLightOptions,
  defaultMarkerOptions,
} from './defaults';
import Globe from './Globe';
import {
  Animation,
  CameraOptions,
  Coordinates,
  FocusOptions,
  GlobeOptions,
  LightOptions,
  Marker,
  MarkerCallback,
  MarkerOptions,
  Optional,
  Size,
} from './types';
import useResize from './useResize';

export interface Props {
  /** An array of animation steps to power globe animations. */
  animations?: Animation[];
  /** Configure camera options (e.g. rotation, zoom, angles). */
  cameraOptions?: Optional<CameraOptions>;
  /** A set of [lat, lon] coordinates to be focused on. */
  focus?: Coordinates;
  /** Configure focusing options (e.g. animation duration, distance, easing function). */
  focusOptions?: Optional<FocusOptions>;
  /** Configure globe options (e.g. textures, background, clouds, glow). */
  globeOptions?: Optional<GlobeOptions>;
  /** Configure light options (e.g. ambient and point light colors + intensity). */
  lightOptions?: Optional<LightOptions>;
  /** A set of starting [lat, lon] coordinates for the globe. */
  lookAt?: Coordinates;
  /** An array of data that will render interactive markers on the globe. */
  markers?: Marker[];
  /** Configure marker options (e.g. tooltips, size, marker types, custom marker renderer). */
  markerOptions?: Optional<MarkerOptions>;
  /** Callback to handle click events of a marker.  Captures the clicked marker, ThreeJS object and pointer event. */
  onClickMarker?: MarkerCallback;
  /** Callback to handle defocus events (i.e. clicking the globe after a focus has been applied).  Captures the previously focused coordinates and pointer event. */
  onDefocus?: (previousFocus: Coordinates, event?: PointerEvent) => void;
  /** Callback to handle mouseout events of a marker.  Captures the previously hovered marker, ThreeJS object and pointer event. */
  onMouseOutMarker?: MarkerCallback;
  /** Callback to handle mouseover events of a marker.  Captures the hovered marker, ThreeJS object and pointer event. */
  onMouseOverMarker?: MarkerCallback;
  /** Callback when texture is successfully loaded */
  onTextureLoaded?: () => void;
  /** Set explicit [width, height] values for the canvas container.  This will disable responsive resizing. */
  size?: Size;
}

export default function ReactGlobe({
  animations,
  cameraOptions,
  focus,
  focusOptions,
  globeOptions,
  lightOptions,
  lookAt,
  markers,
  markerOptions,
  onClickMarker,
  onDefocus,
  onMouseOutMarker,
  onMouseOverMarker,
  onTextureLoaded,
  size: initialSize,
}: Props): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>();
  const globeInstanceRef = useRef<Globe>();
  const mountRef = useRef<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement>();
  const size = useResize(mountRef, initialSize);

  // init
  useEffect(() => {
    const mount = mountRef.current;
    const globeInstance = new Globe(canvasRef.current, tooltipRef.current);
    mount.appendChild(globeInstance.renderer.domElement);
    globeInstance.animate();
    globeInstanceRef.current = globeInstance;

    return (): void => {
      mount.removeChild(globeInstance.renderer.domElement);
      globeInstance.destroy();
    };
  }, []);

  // update callbacks
  useEffect(() => {
    console.log('callbacks');
    globeInstanceRef.current.updateCallbacks({
      onClickMarker,
      onDefocus,
      onMouseOutMarker,
      onMouseOverMarker,
      onTextureLoaded,
    });
  }, [
    onClickMarker,
    onDefocus,
    onMouseOutMarker,
    onMouseOverMarker,
    onTextureLoaded,
  ]);

  // update camera
  useEffect(() => {
    globeInstanceRef.current.updateCamera(lookAt, cameraOptions);
  }, [cameraOptions, lookAt]);

  // update focus
  useEffect(() => {
    globeInstanceRef.current.updateFocus(focus, focusOptions);
  }, [focus, focusOptions]);

  // update globe
  useEffect(() => {
    globeInstanceRef.current.updateGlobe(globeOptions);
  }, [globeOptions]);

  // update lights
  useEffect(() => {
    globeInstanceRef.current.updateLights(lightOptions);
  }, [lightOptions]);

  // update markers
  useEffect(() => {
    globeInstanceRef.current.updateMarkers(markers, markerOptions);
  }, [markerOptions, markers]);

  // apply animations
  useEffect(() => {
    return globeInstanceRef.current.applyAnimations(animations);
  }, [animations]);

  // resize
  useEffect(() => {
    globeInstanceRef.current.resize(size);
  }, [size]);

  return (
    <div ref={mountRef} style={{ height: '100%', width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div ref={tooltipRef} />
    </div>
  );
}

ReactGlobe.defaultProps = {
  animations: [],
  cameraOptions: defaultCameraOptions,
  focusOptions: defaultFocusOptions,
  globeOptions: defaultGlobeOptions,
  lightOptions: defaultLightOptions,
  lookAt: [1.3521, 103.8198],
  markers: [],
  markerOptions: defaultMarkerOptions,
};
