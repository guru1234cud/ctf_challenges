# Multi-stage image: the reconstructed flag (players find this)
# FINAL FLAG (what players will reconstruct): FLAG{vvfvggtgttgggtgt___frfrf}
# We keep everything in maker stages so final history shows only COPY --from=...

# maker1: base64 of "FLAG{"
FROM alpine:3.18 AS maker1
RUN echo "RkxBR3s=" > /p1.b64

# maker2: first chunk "vvfvggtgtt" (we store it reversed so players must rev it)
FROM alpine:3.18 AS maker2
# store reversed so players must reverse it to get original chunk
RUN echo "ttggtg gfvv" | tr -d ' ' | rev > /p2.rev

# maker3: middle chunk "gggtgt___gggtgt" (plain text)
FROM alpine:3.18 AS maker3
RUN printf "gggtgt___gggtgt" > /p3.txt

# maker4: last chunk "frfrf}" but store as ROT13 to require decoding
FROM alpine:3.18 AS maker4
# rot13("frfrf}") -> "seses}"
RUN echo "seses}" > /p4.rot13

# optional decoy stage (harmless)
FROM alpine:3.18 AS decoy
RUN echo "FLAG{QuAgmaIeR53}" > /decoy_note.txt

# final image: copy parts from maker stages (so history shows only COPY --from)
FROM alpine:3.18 AS final
COPY --from=maker1 /p1.b64 /app/part1.b64
COPY --from=maker2 /p2.rev /app/part2.rev
COPY --from=maker3 /p3.txt /app/part3.txt
COPY --from=maker4 /p4.rot13 /app/part4.rot13
COPY --from=decoy /decoy_note.txt /app/decoy_note.txt

# remove parts from the running container so players must inspect layers to find them
RUN rm -f /app/part*.b64 /app/part*.rev /app/part*.txt /app/part*.rot13 || true

CMD ["sh"]
