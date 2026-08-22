/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node",
    "maxmind"
  ]
};

export default nextConfig;
