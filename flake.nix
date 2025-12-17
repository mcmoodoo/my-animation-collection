{
  description = "Remotion wallet animation project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Chrome/Chromium dependencies
            glib
            nss
            nspr
            atk
            at-spi2-atk
            cups
            libdrm
            libxkbcommon
            xorg.libXcomposite
            xorg.libXdamage
            xorg.libXfixes
            xorg.libXrandr
            xorg.libXScrnSaver
            xorg.libXcursor
            xorg.libX11
            xorg.libXext
            xorg.libXtst
            libgbm
            alsa-lib
            dbus
            pango
            cairo
            gdk-pixbuf
            expat
            fontconfig
            freetype
            libuuid
            libsecret
            libxshmfence
            mesa
            libxcb
            xorg.libXau
            xorg.libXdmcp
            xorg.libXrender
            xorg.libXft
            xorg.libXi
          ];

          shellHook = ''
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath (with pkgs; [
              glib
              nss
              nspr
              atk
              at-spi2-atk
              cups
              libdrm
              libxkbcommon
              xorg.libXcomposite
              xorg.libXdamage
              xorg.libXfixes
              xorg.libXrandr
              xorg.libXScrnSaver
              xorg.libXcursor
              xorg.libX11
              xorg.libXext
              xorg.libXtst
              libgbm
              alsa-lib
              dbus
              pango
              cairo
              gdk-pixbuf
              expat
              fontconfig
              freetype
              libuuid
              libsecret
              libxshmfence
              mesa
              libxcb
              xorg.libXau
              xorg.libXdmcp
              xorg.libXrender
              xorg.libXft
              xorg.libXi
            ])}:$LD_LIBRARY_PATH"
          '';
        };
      }
    );
}
