import { describe, expect, it } from "vitest";
import { getEvolutionLineSpeciesIds } from "./evolution.logic";
import type {
  PokeApiEvolutionChain,
  PokeApiEvolutionChainNode,
} from "../../../shared/types/pokemon";

function createChain(
  root: number,
  branches: number[][],
): PokeApiEvolutionChain {
  function createNode(speciesId: number): PokeApiEvolutionChainNode {
    return {
      species: {
        name: `s-${speciesId}`,
        url: `https://pokeapi.co/api/v2/pokemon-species/${speciesId}/`,
      },
      evolves_to: [],
    };
  }

  function createBranchNode(branch: number[]): PokeApiEvolutionChainNode {
    if (branch.length === 0) {
      return createNode(root);
    }

    const [head, ...tail] = branch;
    const headNode = createNode(head);
    let cursor = headNode;

    for (const speciesId of tail) {
      const nextNode = createNode(speciesId);
      cursor.evolves_to = [nextNode];
      cursor = nextNode;
    }

    return headNode;
  }

  return {
    id: 1,
    chain: {
      species: { name: `s-${root}`, url: `https://pokeapi.co/api/v2/pokemon-species/${root}/` },
      evolves_to: branches.map(createBranchNode),
    },
  };
}

describe("getEvolutionLineSpeciesIds", () => {
  it("returns single-species path for no-evolution chain", () => {
    const chain: PokeApiEvolutionChain = {
      id: 1,
      chain: {
        species: {
          name: "ditto",
          url: "https://pokeapi.co/api/v2/pokemon-species/132/",
        },
        evolves_to: [],
      },
    };

    expect(getEvolutionLineSpeciesIds(chain, 132)).toEqual([132]);
  });

  it("returns full line for linear multi-stage chain", () => {
    const chain = createChain(1, [[2, 3]]);

    expect(getEvolutionLineSpeciesIds(chain, 1)).toEqual([1, 2, 3]);
  });

  it("selects deterministic branch when multiple evolution paths exist", () => {
    const chain = createChain(133, [[134], [135], [136]]);

    expect(getEvolutionLineSpeciesIds(chain, 133)).toEqual([133, 134]);
  });
});
