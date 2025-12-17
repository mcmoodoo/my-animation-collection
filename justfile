default:
    @just --list

convert-to-gif in out:
    ffmpeg -i {{in}} -vf "fps=10,scale=1540:-1:flags=lanczos" -c:v gif {{out}}
