/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node"
  ]
};

export default nextConfig;
