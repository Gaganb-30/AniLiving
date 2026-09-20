import { FaAmazon } from 'react-icons/fa';

const AMAZON_STORE_URL =
  'https://www.amazon.in/stores/AniLiving/page/B22965B5-E8E5-42C1-B9BF-6498970CD93B?lp_asin=B0HGRCKZK1&ref_=ast_bln';

const AmazonButton = () => (
  <a
    href={AMAZON_STORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="amazon-float-btn"
    aria-label="Shop AniLiving on Amazon"
    title="Shop us on Amazon"
  >
    <FaAmazon className="amazon-float-icon" />
  </a>
);

export default AmazonButton;
