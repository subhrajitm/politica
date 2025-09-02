import {
  BjpIcon,
  IncIcon,
  AapIcon,
  AitcIcon,
  DefaultPartyIcon,
} from '@/lib/icons';

export function PartyLogo({
  party,
  className,
}: {
  party: string;
  className?: string;
}) {
  const props = { className: className || 'w-8 h-8' };
  switch (party) {
    case 'Bharatiya Janata Party':
      return <BjpIcon {...props} />;
    case 'Indian National Congress':
      return <IncIcon {...props} />;
    case 'Aam Aadmi Party':
      return <AapIcon {...props} />;
    case 'All India Trinamool Congress':
      return <AitcIcon {...props} />;
    default:
      return (
        <DefaultPartyIcon
          {...props}
          className={`${props.className} text-gray-400`}
        />
      );
  }
}
