import flatMap from 'lodash.flatmap';
import some from 'lodash.some';

import {
  TrelloApi,
  StringMap,
  Card,
  CardFacet,
} from '../trello/definitions';

export default (trello: TrelloApi) => async (sourceId: string, targetId: string, labelColours: string[]) => {
  if (sourceId === targetId) {
    throw new Error(`Source and target boards must be distinct!`);
  }

  // FIXME: just get what we need
  const boards = await trello.boards();
  const sourceBoard = boards.find(board => board.id === sourceId);
  const targetBoard = boards.find(board => board.id === targetId);
  if (!sourceBoard) throw new Error(`Could not find board ${sourceId}`);
  if (!targetBoard) throw new Error(`Could not find board ${targetId}`);

  const sourceLists = await trello.lists(sourceBoard.id);
  const sourceListNames = sourceLists.map(l => l.name);

  console.log(JSON.stringify(sourceLists, null, 2));
  await trello.deleteAllCards(targetBoard.id);
  
  const targetLists = await trello.lists(targetBoard.id);
  const targetListNames = targetLists.map(l => l.name);

  // trello doesn't allow deleting lists, so instead we'll archive the ones
  // that don't match before creating new ones to match the source board
  await Promise.all(
    targetLists
      .filter(list => sourceListNames.indexOf(list.name) === -1)
      .map(list => trello.archiveList(list.id))
  );
  
  await Promise.all(
    sourceLists
      .filter(list => targetListNames.indexOf(list.name) === -1)
      .map(list => trello.createList(targetBoard.id, list.name, list.pos))
  );

  // FIXME: for now, just re-fetch the lists so we have an up-to-date name-to-id mapping
  const finalLists = await trello.lists(targetBoard.id);
  const targetListIdFromName: StringMap = {};
  finalLists.forEach(list => targetListIdFromName[list.name] = list.id);

  await Promise.all(
    flatMap(
      sourceLists,
      list => list.cards.map((card: Card) => ({
        ...card,
        listId: targetListIdFromName[list.name]
      }))
    )
      .filter(card => some(card.labels, (label: any) => labelColours.indexOf(label.color) !== -1))
      .map(card => trello.cloneCard(card.id, card.listId, [CardFacet.All]))
  );

  return true;
};

/**
Syncing Eng Management (Private) to Eng Management (Public)...
[
  {
    "id": "5e62bc38f432b31e229c9595",
    "name": "Laccetti",
    "cards": []
  },
  {
    "id": "5e62bc2f1e52750f3a0df9a0",
    "name": "Alex",
    "cards": []
  },
  {
    "id": "5e62bc2e260d208d0debefd1",
    "name": "Cam",
    "cards": [
      {
        "id": "5e62c40f40e7bf2a1acd224d",
        "labels": []
      },
      {
        "id": "5e67eb9c991ebf59aae29fb3",
        "labels": []
      },
      {
        "id": "5e62c416a9617d83cf8ff9cc",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e62c4872c8bfa051a9477fa",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e62c4ddea49c566b948ba00",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e62c7d2b8ee217d5218812e",
        "labels": []
      },
      {
        "id": "5e62c7e5a5e0765290b25271",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e6281ff3d9c86460f090cf2",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e5fd993f43b981b933e66d9",
        "labels": [
          {
            "id": "5e62bc2baf988c41f2a5afcd",
            "idBoard": "5e62bc2b1c038a4fe8cd958a",
            "name": "Public",
            "color": "green"
          }
        ]
      },
      {
        "id": "5e6165b57a72dd0ed6319570",
        "labels": []
      },
      {
        "id": "5e458d31c11b1f55e1e3d40d",
        "labels": []
      },
      {
        "id": "5e6004ad1c6e6348bb00b474",
        "labels": []
      },
      {
        "id": "5e5564bf0efcb24904a29624",
        "labels": []
      }
    ]
  },
  {
    "id": "5e62bc31f124c738b2617c40",
    "name": "Asaf",
    "cards": []
  },
  {
    "id": "5e62bc33dbf60c3df2189040",
    "name": "Bhavin",
    "cards": []
  }
]
 */