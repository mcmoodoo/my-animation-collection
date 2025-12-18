default:
    @just --list

convert-to-gif in out:
    ffmpeg -i {{in}} -vf "fps=10,scale=1540:-1:flags=lanczos" -c:v gif {{out}}

convert-from-dot type="png" src="graphviz/flowchart-manual-approach.dot" out="out/flowchart-manual.png":
    dot -T {{type}} {{src}} -o {{out}} 

convert-from-mermaid in="mermaid/manual-setup.mmd" out="out/manual-setup.svg":
    mmdc -i {{in}} -o {{out}}
