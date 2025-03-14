import {FC} from "react";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";

const TutorialAndCards: FC = () => {

    return(
        <Modal>
            <div className="flex min-w-[112vh] min-h-[64vh] justify-center items-center">
                <div className="flex flex-col gap-4 p-8 justify-center items-center w-1/3">
                     <div className="tutorial-and-cards-panel" >
                         <div >
                             <div className="decorative-hex" id="tutorial" >

                             </div>
                             <p>
                                 Play the tutorial to learn the game mechanics and how to play
                             </p>
                             <Button text="Tutorial  " onClick={() => alert("TODO")} />
                         </div>
                         <span className="vr" ></span>
                         <div>
                             <div className="decorative-hex" id="rules" >

                             </div>
                             <p>
                                 Check our set of rules to learn how to play the game
                             </p>
                             <Button text="Rules     " onClick={() => alert("TODO")} />
                         </div>
                         <span className="vr" ></span>
                         <div>
                             <div className="decorative-hex" id="cards" >
                             </div>
                             <p>
                                 Browse cards from each deck, learn their about their abilities and how to use them
                             </p>
                             <Button text="Cards     " onClick={() => alert("TODO")} />
                         </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default TutorialAndCards;