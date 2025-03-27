import {FC, useContext, useEffect, useState} from "react";
import {IMatch, IPlayerState, IUser} from "../../interfaces.ts";
import {Button} from "../../components/Button.tsx";
import {useNavigate} from "react-router-dom";
import {parseTimeLimit} from "../../utils.ts";
import {AuthContext, ModalContext, UserContext} from "../../context.tsx";
import {findPlayerById} from "../../api/user.ts";
import {calcTimeLeft, criticalTime} from "./Hud.tsx";
import {sendFriendInvite} from "../../api/friend.ts";
import MenuOverlay from "./components/MenuOverlay.tsx";
import styles from "../../styles/battle_page/ResultScreen.module.css";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";

export enum MatchResult {
    victory = "Victory",
    defeat = "Defeat",
    draw = "Draw"
}

export const getWinner = (player1: IPlayerState, player2: IPlayerState): string | undefined => {
    const hasPlayerLost = (player: IPlayerState) => {
        return player.bonusHealth.length + player.drawingDeck.length <= 0 || (player.timeLeft && player.timeLeft < 1);
    }

    if (hasPlayerLost(player1) && !hasPlayerLost(player2)) {
        return player2.userId;
    } else if (hasPlayerLost(player2) && !hasPlayerLost(player1)) {
        return player1.userId;
    } else if (hasPlayerLost(player1) && hasPlayerLost(player2)) {
        return MatchResult.draw;
    } else {
        return undefined;
    }
}

const ResultScreen: FC<{ match: IMatch, player: IPlayerState, opponent: IPlayerState }> = ({ match, player, opponent }) => {

    const navigate = useNavigate();
    const winner = getWinner(player, opponent);

    const getResultText = (winner: string | undefined) => {
        switch (winner) {
            case player.userId:
                return MatchResult.victory;
            case opponent.userId:
                return MatchResult.defeat;
            case MatchResult.draw:
                return MatchResult.draw;
            default:
                return MatchResult.draw;
        }
    }

    const getResultStyleClass = (winner: string | undefined) => {
        switch (winner) {
            case player.userId:
                return styles.victory;
            case opponent.userId:
                return styles.defeat;
            case MatchResult.draw:
                return styles.draw;
            default:
                return styles.draw;
        }
    }

    return(
      <MenuOverlay>
          <div className={styles.container} >
              <h1 className={`${getResultStyleClass(winner)}`} >
                  {getResultText(winner)}
              </h1>

              <horizontal-line/>

              <div className={styles.playerStatistics} >
                  <PlayerStatistics player={opponent} hasWon={winner === opponent.userId} />
                  <PlayerStatistics player={player} hasWon={winner === player.userId} />
              </div>

              <horizontal-line/>

              <ul className={styles.statistics} >
                  { match.battle.timeLimit &&
                      <li>
                          ○ Time limit:
                          <span>{parseTimeLimit(match)}|{parseTimeLimit(match)} min</span>
                      </li>
                  }
                  <li>
                      ○ Turns taken:
                      <span>{ Math.ceil(match.battle.turn) / 2 }</span>
                  </li>
              </ul>

              <horizontal-line/>

              <Button text={"Return to Home"} onClick={() => navigate("/")} />
          </div>
      </MenuOverlay>
    );
}

const PlayerStatistics: FC<{ player: IPlayerState, hasWon?: boolean}> = ({ player, hasWon }) => {

    const { openInfoModal } = useContext(ModalContext);
    const [details, setDetails] = useState<{username: string, picture: string}>();
    const [canAddFriend, setCanAddFriend] = useState<boolean>(false);
    const userId = useContext(AuthContext).user?.sub;
    const { _user } = useContext(UserContext);
    const health = player.bonusHealth.length + player.drawingDeck.length;

    useEffect(() => {
        if (_user && _user.userId === player.userId) {
            setDetails({
                username: _user.username,
                picture: _user.picture
            });
        } else if (player.userId) {
            findPlayerById(player.userId).then(response => {
                if (response?.ok && response?.body) {
                    const userDetails = response.body as IUser

                    if (userId && areNotFriends(userId, userDetails)) {
                        setCanAddFriend(true);
                    }

                    setDetails({
                        username: userDetails.username,
                        picture: userDetails.picture
                    })
                }
            });
        }
    }, [player.userId]);

    const sendFriendRequest = async () => {
        if (canAddFriend && player.userId) {
            const response = await sendFriendInvite(player.userId);
            if (!response.ok) {
                openInfoModal(
                    <p className="w-80 text-center text-lg" >
                        The friend request has been sent to {details?.username}
                    </p>
                );
            }
            setCanAddFriend(false);
        }
    }

    const areNotFriends = (user1Id: string, user2: IUser) => {
        if (user1Id !== user2.userId)
            return false;

        if (user2.friends.includes(user1Id))
            return false;

        user2.requests.forEach(request => {
            if (request.fromId === user1Id || request.toId === user1Id)
                return false;
        });
    }

    const getOutcomeStyleClass = (hasWon: boolean | undefined) => {
        switch (hasWon) {
            case true:
                return styles.winner;
            case false:
                return styles.loser;
            default:
                return "";
        }
    }

    return( details &&
        <div className={getOutcomeStyleClass(hasWon)} >
            <AvatarDisplay avatar={details.picture} />
            <h1>{details.username}</h1>
            <ul>
                <li>
                    <span>○ Health left:</span>
                    <span className={health < 1 ? styles.criitical : "" } >
                        {health}
                    </span>
                </li>
                { player.timeLeft &&
                    <li>
                        <span>○ Time left:</span>
                        <span className={player.timeLeft < criticalTime ? styles.criitical : "" } >
                            {calcTimeLeft(player.timeLeft)}
                        </span>
                    </li>
                }
            </ul>
            { canAddFriend && <Button text={"Add Friend"} onClick={sendFriendRequest} /> }
        </div>
    );
}

export default ResultScreen;