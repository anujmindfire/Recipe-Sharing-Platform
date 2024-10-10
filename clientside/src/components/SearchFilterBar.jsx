import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/searchFilterBar.module.css';

const SearchFilterBar = ({ searchParams, handleSearchChange, uniquePrepTimes, uniqueCookTimes, placeholder }) => {
    const [activeDropdown, setActiveDropdown] = useState('');
    const location = useLocation();

    const filters = [
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/55bdabcc3e4512c59afe449d9d1b546b517fd488685996453161f536af6ad420?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Ratings', 
            dropdownKey: 'rating', 
            dropdownItems: [1, 2, 3, 4, 5] 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/7635bf000a4247eb5045ce4726f20b5360ab91f5e68ac9a31ef5c32e01d66453?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Preparation Time', 
            dropdownKey: 'prepTime', 
            dropdownItems: uniquePrepTimes 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/62228860ee69f4142ec7e161453f90cc9bf9eceb969129ee603864326d91ef26?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Cooking Time', 
            dropdownKey: 'cookTime', 
            dropdownItems: uniqueCookTimes 
        }
    ];

    const shouldShowFilters = ['/profile/recipes', '/profile/favourites', '/recipes'].includes(location.pathname);

    const handleDropdownSelect = (filterKey, value) => {
        handleSearchChange({ target: { name: filterKey, value } });
        setActiveDropdown('');
    };

    const handleRemoveFilter = (filterKey) => {
        handleSearchChange({ target: { name: filterKey, value: '' } });
    };

    return (
        <div className={styles.searchFilterContainer}>
            <div className={styles.searchWrapper}>
                <form className={styles.searchBar}>
                    <input
                        type='text'
                        name='query'
                        className={styles.searchInput}
                        placeholder={placeholder}
                        value={searchParams.query}
                        onChange={handleSearchChange}
                    />
                </form>
            </div>

            {shouldShowFilters && (
                <div className={styles.filterBar}>
                    {filters.map((filter, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <button
                                className={styles.filterButton}
                                onClick={() => setActiveDropdown(activeDropdown === filter.dropdownKey ? '' : filter.dropdownKey)}
                                style={{
                                    backgroundColor: searchParams[filter.dropdownKey] ? '#d3f9d8' : '',
                                    borderColor: searchParams[filter.dropdownKey] ? '#36c48a' : ''
                                }}
                            >
                                <img src={filter.icon} alt='' className={styles.filterIcon} />
                                <span>{searchParams[filter.dropdownKey] ? `${filter.label}: ${searchParams[filter.dropdownKey]}` : filter.label}</span>
                                <img src='https://cdn.builder.io/api/v1/image/assets/TEMP/ff486d73e470ae303168e1ba7d41e5871a99c7f00ee81628e738483cb9553e6b?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca' alt='' className={styles.arrowIcon} />
                            </button>

                            {activeDropdown === filter.dropdownKey && (
                                <div className={styles.dropdown}>
                                    {filter.dropdownItems.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleDropdownSelect(filter.dropdownKey, item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.selectedFilters}>
                {filters.map((filter) => (
                    searchParams[filter.dropdownKey] && (
                        <div key={filter.dropdownKey} className={styles.filterTag}>
                            {`${filter.label}: ${searchParams[filter.dropdownKey]}`}
                            <button onClick={() => handleRemoveFilter(filter.dropdownKey)} className={styles.removeFilterButton}>
                                &#10005;
                            </button>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default SearchFilterBar;
