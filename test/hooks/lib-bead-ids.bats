#!/usr/bin/env bats
# The id extraction in `.githooks/lib-bead-ids.sh`, on its own (enigma2_player-35d).
#
# `warn_unknown_bead_ids` cannot be tested here: it needs `bd`, `jq` and a real issue DB to say
# which of the ids it found are unknown, and a throwaway repository has none. What CAN be tested
# without any of that is which strings count as an id in the first place — which is where the
# defect was: the pattern matched the first three characters of the release artefact names this
# repository hosts (`enigma2_player-windows-x64-setup-*.exe`), so every commit touching the
# download data warned about a bead called `-win`. Hence the extraction is its own function.

load helper

setup() {
  # No repository: these cases call the function, they do not commit. $HOOKS_SRC so the mutation
  # check can point them at a deliberately broken copy, like every other suite here.
  . "$HOOKS_SRC/lib-bead-ids.sh"
}

ids_in() { printf '%s\n' "$1" | bead_ids_in_text enigma2_player; }

@test "lib-bead-ids: an id in running text is found" {
  run ids_in "fixed in enigma2_player-35d, see also enigma2_player-dp3"
  [ "$status" -eq 0 ]
  contains "enigma2_player-35d"
  contains "enigma2_player-dp3"
}

@test "lib-bead-ids: a sub-task id keeps its number" {
  # Another prefix on purpose: this repository has no sub-task to point at, and an invented
  # `enigma2_player-*` id in a fixture would make every commit touching this file warn about it -
  # the guard tripping over its own test is the defect this bead is about.
  run bash -c ". '$HOOKS_SRC/lib-bead-ids.sh'; printf 'blocked by bd-abc.2\n' | bead_ids_in_text bd"
  [ "$status" -eq 0 ]
  [ "$output" = "bd-abc.2" ]
}

@test "lib-bead-ids: an id that ends a sentence is found without the full stop" {
  # The boundary that rejects a longer token must not reject punctuation, or every id at the end
  # of a sentence would go unchecked - the quiet half of the same defect.
  run ids_in "this is enigma2_player-35d."
  [ "$status" -eq 0 ]
  [ "$output" = "enigma2_player-35d" ]
}

@test "lib-bead-ids: a download file name is not an id" {
  run ids_in "enigma2_player-windows-x64-setup-1.1.1.exe enigma2_player-linux-x64-1.1.1.deb enigma2_player-macos-1.1.1.dmg"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "lib-bead-ids: an id next to a download file name is still found" {
  run ids_in "enigma2_player-35d renames enigma2_player-linux-x64-1.1.1.deb"
  [ "$status" -eq 0 ]
  [ "$output" = "enigma2_player-35d" ]
}

@test "lib-bead-ids: an id mentioned twice is reported once" {
  run ids_in "enigma2_player-35d and enigma2_player-35d again"
  [ "$status" -eq 0 ]
  [ "$output" = "enigma2_player-35d" ]
}

@test "lib-bead-ids: text with no id yields nothing" {
  run ids_in "chore: nothing to see here"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}

@test "lib-bead-ids: the prefix is the argument, not a constant" {
  # A project that renamed its prefix must keep working; the DB is what the caller asks.
  run bash -c ". '$HOOKS_SRC/lib-bead-ids.sh'; printf 'bd-abc enigma2_player-35d\n' | bead_ids_in_text bd"
  [ "$status" -eq 0 ]
  [ "$output" = "bd-abc" ]
}
