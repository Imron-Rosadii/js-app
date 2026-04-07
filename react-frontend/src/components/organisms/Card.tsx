import { CardProps } from "../../types";
import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Text } from "../atoms/Text";

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  onAction,
  actionText = "Learn More",
  footer,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {image && (
        <img src={image} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <Heading level={3} className="mb-2">
          {title}
        </Heading>
        <Text variant="body" className="mb-4">
          {description}
        </Text>
        {onAction && (
          <Button onClick={onAction} variant="primary" size="sm">
            {actionText}
          </Button>
        )}
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
      </div>
    </div>
  );
};
