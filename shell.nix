# by default nix uses channel that can be different form setup to setup
# pin package tree to ensure every machine has the same outcome
with (import (builtins.fetchTarball {
  name = "nixpkgs-fcc28fe3061736e518457d7c8766552e68f67d95";
  url = "https://github.com/NixOS/nixpkgs/archive/fcc28fe3061736e518457d7c8766552e68f67d95.tar.gz";
  sha256 = "0ajl97cdivzw0rdr5kn2hfhzjhhr2mzc0yiw5jgf0s1vxhv8hb4f";
}) {});

with pkgs; mkShell {

  # dependencies
  buildInputs = [
    bash coreutils curl jq
    awscli2 sops

    nodejs-16_x yarn
  ];
}
