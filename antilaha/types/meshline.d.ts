import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: React.ComponentProps<typeof MeshLineGeometry>
    meshLineMaterial: React.ComponentProps<typeof MeshLineMaterial>
  }
}

export { MeshLineMaterial }
