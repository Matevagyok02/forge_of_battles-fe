import {FC} from "react";

export interface OptionButton {
    text: string;
    callback?: (args?: any) => void;
    subOptions?: SubOptionButton[];
}

interface SubOptionButton {
    text: string;
    callback: (args?: any) => void;
}

const MultipleOptionsButton: FC<{
    options: OptionButton[];
}> = ({ options }) => {

    return(
      <ul className="option-list" >
          { options.map((option, index) =>
            option.subOptions ?
                <li className="sub-option-list-btn" key={index} >
                    <h1>
                        {option.text}
                    </h1>
                    { option.subOptions.map((subOption, index) =>
                        <li key={index} className="sub-option-btn" onClick={subOption.callback} >
                            { subOption.text }
                        </li>
                    )}
                </li>
                :
                option.callback && (
                    <li key={index} className="option-btn" onClick={option.callback} >
                        { option.text }
                    </li>
                )
          )}
      </ul>
    );
}

export default MultipleOptionsButton;