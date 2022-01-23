import _ from "lodash";

import { useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import { cardState, orderedCards } from "../../stores/cards";

import { Card } from "../../types/KanbanBoard";

const useCards = () => {
  const [items, setItems] = useRecoilState(cardState);
  const cards = useRecoilValue(orderedCards);

  const dragData = useRef<Card | null>();
  const dragOverItem = useRef<Card | null>();
  const dragOverGroup = useRef<any>({});

  const handleDragStart = (item: Card) => {
    dragData.current = item;
  };

  const handleDragEnterColumn = (columnId: string) => {
    dragOverGroup.current = columnId;
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDragOverItem = (item: Card) => {
    dragOverItem.current = item;
  };

  const getSortedColumnCardList = (
    targetItem: Card,
    columnId: string
  ): Card[] => {
    const newOrder = cards.filter((card) => card.columnId === columnId);
    const targetIndex = cards.findIndex(
      (card) => card.id === dragOverItem.current?.id
    );

    const newCards = [...newOrder].filter((item) => item.id !== targetItem.id);
    const newCard: Card = _.cloneDeep(targetItem);

    newCard.columnId = columnId;
    newCards.splice(targetIndex, 0, newCard);

    return newCards.map((item, idx) => {
      return {
        ...item,
        order: idx + 1,
      };
    });
  };

  const createCard = (newCard: Card) => {
    setItems([...cards, newCard]);
  };

  const updateCardList = (targetItem: Card, columnId: string) => {
    const cardsWithoutUpdatedOrders = items.filter(
      (card) => card.columnId !== columnId && targetItem.id !== card.id
    );
    const cardWithUpdatedOrders = getSortedColumnCardList(targetItem, columnId);

    setItems([...cardWithUpdatedOrders, ...cardsWithoutUpdatedOrders]);
  };

  const updateCard = (updatedCard: Card) => {
    const newCards = [...cards];
    const cardIndex = cards.findIndex((card) => card.id === updatedCard.id);

    newCards[cardIndex] = updatedCard;
    setItems([...newCards]);
  };

  const handleDrop = (e: any) => {
    const selected = dragData.current;

    if (selected) {
      updateCardList(selected, dragOverGroup.current);
    }
    dragOverItem.current = null;
    dragOverGroup.current = null;
    dragData.current = null;
  };

  const removeCardFromList = (toBeDeletedCard: Card) => {
    const updatedCardColumnList = cards
      .filter(
        (card) =>
          card.columnId === toBeDeletedCard.columnId &&
          card.id !== toBeDeletedCard.id
      )
      .map((card, idx) => {
        return {
          ...card,
          order: idx + 1,
        };
      });

    return updatedCardColumnList;
  };

  const removeCard = (toBeDeletedCard: Card) => {
    const cardsWithToBeDeletedCard = removeCardFromList(toBeDeletedCard);
    const cardsWithoutUpdatedOrders = items.filter(
      (card) => card.columnId !== toBeDeletedCard.columnId
    );

    setItems([...cardsWithToBeDeletedCard, ...cardsWithoutUpdatedOrders]);
  };

  return {
    cards,
    handleDragStart,
    handleDragEnterColumn,
    handleDragOver,
    handleDragOverItem,
    handleDrop,
    createCard,
    updateCard,
    removeCard,
  };
};

export default useCards;
