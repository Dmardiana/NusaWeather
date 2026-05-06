import React from 'react';
import { View } from 'react-native';

const MapView = ({ children, style }) => React.createElement(View, { style }, children);
const Marker = ({ children }) => React.createElement(View, null, children);
const UrlTile = () => null;
const Callout = () => null;
const Polyline = () => null;
const Polygon = () => null;
const Circle = () => null;

MapView.Marker = Marker;
MapView.UrlTile = UrlTile;
MapView.Callout = Callout;

export default MapView;
export { Marker, UrlTile, Callout, Polyline, Polygon, Circle };
